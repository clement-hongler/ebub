const electron = require('electron'); 

const path = require('path'), fs = require('fs'), net = require('net'), os = require('os');
const http = require('http');

// const wsLib = require('ws');  
const { app, ipcMain, dialog, BrowserWindow, Menu, shell } = electron;
const childProcess = require('node:child_process');

const lead_server_port = 16223; 
const follower_server_port = 17223;
let lead_server = undefined;
let follower_server = undefined;
let lead_wss_by_uid = {};
let follower_wss_by_uid = {};

const server_port = 9723;

const def_data_dir_name = 'ebub-data'; 
const child_dir_names = [];

// app_dir and data_dir are set with on_ready
let app_dir = undefined; // the app directory
let data_dir = undefined; // the full path of the current directory (set by set_current_dir, in particular at the program startup)

function get_ymdhm_date() { // {?} slightly different from the function in common.js
    const iso_string = (new Date()).toISOString();
    return iso_string.substring(0, 10) + '-' + iso_string.substring(11, 13) + '-' + iso_string.substring(14, 16);
}

/* <UTILS> */
function ensure_dir_exists(dir) { 
    try { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive : true }); return true; }
    catch (err) { return false; }
}

function ensure_path_is_valid(file_path) { ensure_dir_exists(path.dirname(file_path)) }

function set_current_dir(dir) { 
    const child_dirs_to_create = child_dir_names.map(child_dir_name => path.join(dir, child_dir_name));
    [dir, ... child_dirs_to_create].forEach(dir_to_create => ensure_dir_exists(dir_to_create)); 
    cur_dir = dir; 
}

function get_full_date_with_time() { return (new Date()).toISOString().replaceAll(':', '-').replaceAll('T', '_').substring(0, 19) } // {?} should be simpler

function get_cwd() { return electron.app.getAppPath() }

// Recursive copy from source to dest of a directory
function copy_dir_sync(source_path, dest_path) {
    if (!fs.existsSync(dest_path)) fs.mkdirSync(dest_path);
    const entries = fs.readdirSync(source_path, { withFileTypes: true });
    for (const entry of entries) {
        const [entry_source_path, entry_dest_path] = [path.join(source_path, entry.name), path.join(dest_path, entry.name)];
        if (entry.isDirectory()) copy_dir_sync(entry_source_path, entry_dest_path);
        else fs.copyFileSync(entry_source_path, entry_dest_path);
    }
}

////////////////////
/// LOGGING CODE ///
////////////////////
const log_dir = path.join(os.homedir(), 'ebub-data'), logPath = path.join(log_dir, 'main-log.txt');
function log(str, colorFunction=undefined) { 
    fs.appendFileSync(logPath, str + '\n'); console.log(colorFunction != undefined ? colorFunction(str) : str); 
}
ensure_dir_exists(log_dir); log(`\n\n${get_full_date_with_time()}: main.js started`);

/* </UTILS> */


/* <CALLBACKS> */

async function on_ready() {
	create_window(); 
    create_menu();
    app.on('window-all-closed', on_window_all_closed);
    add_handles(); 
    app_dir = get_cwd(); data_dir = path.join(os.homedir(), def_data_dir_name);
    log("\n\n");
    await launch_local_server_if_not_running();
}

function add_handles() {
    const im = ipcMain;
    im.handle('get-console-stdout', on_get_console_stdout);
    im.handle('get-console-stderr', on_get_console_stderr)
    im.handle('save', on_save);
    im.handle('load', on_load);
    im.handle('request-file-to-open', on_request_file_to_open);
    im.handle('request-select-dir', on_request_select_dir);
    im.handle('request-file-to-save', on_request_file_to_save);
    im.handle('copy-file', on_copy_file);
    im.handle('copy-dir', on_copy_dir);
    im.handle('is-file-existing', on_is_file_existing);
    im.handle('is-dir-existing', on_is_dir_existing);
    im.handle('get-path-sep', on_get_path_sep);
    im.handle('ensure-dir-exists', on_ensure_dir_exists);
    im.handle('get-data-dir', on_get_data_dir);
    im.handle('get-app-dir', on_get_app_dir);
    im.handle('is-ws-available', on_is_ws_available);
}

// To revive in case there is no window
// function onActivate() { if (BrowserWindow.getAllWindows().length == 0) create_window(); }

function create_window() {
    // needed to launch preload which will connect the front-end and the back-end
    const [width, height] = [1024, 768];
    const icon = path.join(__dirname, 'ebub-icons/ebub-icon.png');
	const web_prefs = { preload : path.join(__dirname, 'preload.js') }; 
	const window_params = { width, height, icon, webPreferences: web_prefs, fullscreen : true };
	const win = new electron.BrowserWindow(window_params);

	win.loadFile('index.html');
	win.maximize();
	win.show();
}

function create_menu() {
    const menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ]

        },
        {
            label: 'View',
            submenu: [
                { role: 'toggleDevTools' },
                { role: 'togglefullscreen' },
                {
                    role: 'resetZoom',
                    visible: false
                },
                {
                    role: 'zoomIn',
                    accelerator: '',
                    visible: false
                },
                {
                    role: 'zoomOut',
                    accelerator: '',
                    visible: false
                }
            ]
        },

        {
            label: 'Help',
            submenu: [ 
                {
                    label: 'Eulalie: Blockchain Notarization',
                    click: async () => { await shell.openExternal('http://www.eulalie.io'); }
                }
            ]
        }   
    ]
    );
    Menu.setApplicationMenu(menu);

}

function on_window_all_closed() {
	if (process.platform !== 'darwin') electron.app.quit();
}

/* </CALLBACKS> */

/* <UTILS> */

async function launch_local_server() {
    // {?} Hacky
    let possible_server_dirs= [path.join(app_dir, '..', '9723'), path.join(app_dir, '..', '..', '9723'), path.join(os.homedir(), '9723'), path.join(os.homedir(), 'Projects', '9723')];
    possible_server_dirs = possible_server_dirs.filter(path => fs.existsSync(path));
    if (possible_server_dirs.length == 0) { log("No 9723 folder found"); return; }
    const server_path = path.join(possible_server_dirs[0], 'ebub-9723-launcher.js');
    log(`Attempting to launch server from app at location ${server_path}`);
    try {
        const server_process = childProcess.spawn('node', [server_path]); // {?} a bit hacky
            // Important, otherwise crashes propagate to the front-end   
        server_process.on('error', (err) => { log(`CHILD PROCESS ERROR ${err}`); }); 
        server_process.stdout.on('data', data => log(`Server: ${data}`));
        server_process.stderr.on('data', data => log(`Server error: ${data}`));
        server_process.on('close', closure_code => log(`Server closed: ${closure_code}`));
        log(`Server successfully launched`);
    }
    catch (e) {
        log("Exception while launching local server", e);
    }
}

async function launch_local_server_if_not_running() { 
    if (!await is_ws_available('localhost', server_port)) await launch_local_server(); else log(`Server already working on port ${server_port}`);
}

/* </UTILS> */



/* <IPC CALLBACKS> */

// Should be called when the process is terminated
function on_exit() {
}

process.on('exit', on_exit);

// A bit hacky, but works
async function get_free_port_number() {
    const free_socket_server = net.createServer(sock => sock.end('')); 
    let free_port_number = undefined;
    await new Promise(resolve => { 
        free_socket_server.listen(0, () => { free_port_number = free_socket_server.address().port; resolve(); }); 
    });
    return free_port_number;
}


async function on_get_console_stdout(event, { since }) {
    return console_stdout; // HACKY, UGLY AND INEFFICIENT
}

async function on_get_console_stderr(event, { since }) {
    return console_stderr;
}

async function on_save(event, { data, file_name, file_path, is_within_data_dir, is_within_app_dir }) {
    const dir_path = is_within_data_dir ? data_dir : is_within_app_dir ? app_dir : '.';
    if (file_path == undefined) file_path = path.join(dir_path, file_name);
    if (file_path == undefined) return `File path could not be determined`;
    ensure_path_is_valid(file_path);
    fs.writeFileSync(file_path, data);
    return `Saved to ${file_path}`;
}

async function on_load(event, { file_name, file_path, is_within_data_dir, is_within_app_dir }) {
    if (file_path == undefined) file_path = path.join(is_within_data_dir ? data_dir : is_within_app_dir ? app_dir : '', file_name);
    if (file_path == undefined) return log(`File path could not be determined`); // returns undefined
    let data = fs.readFileSync(file_path);
    data = `${data}`;
    return data;
}

async function get_open_file_from_user(dialog_title) {
    const files = await dialog.showOpenDialog( { title: dialog_title, properties : ['openFile'] });
    if (!files) return undefined;
    const { filePaths: file_paths, canceled } = files;
    return { file_paths, canceled };
}

async function get_select_dir_from_user(dialog_title, default_path, allow_create=true) { 
    const properties = allow_create ? ['openDirectory', 'createDirectory'] : ['openDirectory']
    const result = await dialog.showOpenDialog({ title: dialog_title, properties, defaultPath: default_path });
    const { filePaths: file_paths } = result;
    return file_paths[0] ?? undefined;
}

async function get_file_to_save_from_user(dialog_title, file_extension, default_file_name) {
    const title = dialog_title ?? "Save file to";
    const ymdhm_date = get_ymdhm_date();
    default_file_name ??= `ewo-${ymdhm_date}${file_extension}`;
    const default_path = path.join(app.getPath('documents'), default_file_name);
//    log(default_path);
    const files = await dialog.showSaveDialog( { title, defaultPath: default_path });
    if (!files) return undefined;
    const { filePath: file_path, canceled } = files;
    return { file_path, canceled }  ;
}

async function on_request_file_to_open(event, { dialog_title }) { // {?} perhaps add a default place
    return await get_open_file_from_user(dialog_title ?? "Load file"); 
}

async function on_request_select_dir(event, { dialog_title, default_path }) {
    dialog_title ??= "Select directory";
    default_path ??= os.homedir();
    const dir_path = await get_select_dir_from_user(dialog_title, default_path);
    return dir_path;
}

async function on_request_file_to_save(event, { dialog_title, file_extension, default_file_name }) {
    dialog_title ??= 'Save file to';
    file_extension ??= '.json';
    const files = await get_file_to_save_from_user(dialog_title, file_extension, default_file_name);
    return files;
}

// {?} needs a clean-up
async function on_copy_file(event, { source, destination, source_path, dest_path, is_within_data_dir, is_within_app_dir, is_source_in_data_dir, is_source_in_app_dir }) {
    if (source_path == undefined) {
        if (is_source_in_app_dir) source_path = path.join(data_dir, source);
        else if (is_source_in_app_dir) source_path = path.join(app_dir, source);
    }

    if (dest_path == undefined) { 
        if (is_within_data_dir) dest_path = path.join(data_dir, destination);
        else if (is_within_app_dir) dest_path = path.join(app_dir, destination);
    }

    if (source_path == undefined) return { status: 'Failure: source_path not defined' };
    if (dest_path == undefined) return { status: 'Failure: dest_path not defined' };

    log(`Copying file from ${source_path} to ${dest_path}`);
    try { fs.copyFileSync(source_path, dest_path); return { status : 'Success', dest_path }; }
    catch (err) { return { status : `${err}` }; }
}

async function on_copy_dir(event, { source, destination, source_path, dest_path, is_source_in_app_dir, is_source_in_data_dir, is_dest_in_data_dir, is_dest_in_app_dir }) {
    if (source_path == undefined) {
        if (is_source_in_data_dir) source_path = path.join(data_dir, source);
        if (is_source_in_app_dir) source_path = path.join(app_dir, source);
    }
    if (dest_path == undefined) {
        if (is_dest_in_data_dir) dest_path = path.join(data_dir, destination);
        if (is_dest_in_app_dir) dest_path = path.join(app_dir, destination);
    }
    if (source_path == undefined) return { status: 'Failure: source_path not defined' };
    if (dest_path == undefined) return { status: 'Failure: dest_path not defined' };
    try { copy_dir_sync(source_path, dest_path); return { status : 'Success', dest_path }; }
    catch (err) { return { status : 'Failure' }; }
}

async function on_is_file_existing(event, { file_name, file_path, is_within_data_dir, is_within_app_dir }) { 
    if (file_path == undefined) file_path = path.join(is_within_data_dir ? data_dir : is_within_app_dir ? app_dir : '', file_name);
    return fs.existsSync(file_path);
}

async function on_is_dir_existing(event, { file_name, file_path, is_within_data_dir, is_within_app_dir }) {
    if (file_path == undefined) file_path = path.join(is_within_data_dir ? data_dir : is_within_app_dir ? app_dir : '', file_name);
    try { fs.readdirSync(file_path); return true; }
    catch (err) { return false }
}


async function on_get_path_sep(event, dict) { return path.sep }
async function on_ensure_dir_exists(event, { dir }) { return ensure_dir_exists(dir) }
async function on_get_data_dir(event, dict) { return data_dir }
async function on_get_app_dir(event, dict) { return app_dir }

async function on_is_ws_available(event, { host, port }) {
    const headers = { 'Connection': 'Upgrade', 'Upgrade': 'websocket', 'Sec-WebSocket-Key': 'randombase64key==', 'Sec-WebSocket-Version': '13' }
    return new Promise((resolve, reject) => {
        const req = http.request({ port, host, headers });
        req.on('upgrade', (res, socket, upgrade_head) => { socket.end(); resolve(true); });
        req.on('error', e => resolve(false));
        req.on('response', res => { log(res.statusCode); resolve(false); });
        req.end();
    })
}

async function check_websocket_server(host, port, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        const timer = setTimeout(() => { socket.destroy(); reject(new Error('check_websocket_server: timeout')); }, timeout);
        socket.once('error', (err) => { clearTimeout(timer); reject(err); });
        socket.once('connect', () => { clearTimeout(timer); socket.destroy(); resolve('Server is listening'); });
        socket.connect({ host, port });
    });
}

async function is_ws_available(host, port) {
    try { const res = await check_websocket_server(host, port); return true; }
    catch (err) { return false; }
}

async function on_is_ws_available(event, { host, port }) { return await is_ws_available(host, port) }

/* </IPC CALLBACKS> */

app.whenReady().then(on_ready);
