const electron = require('electron');


const { contextBridge, ipcRenderer } = electron;

// Document eapi will contain the methods getCode, saveCode, runCode, getConsole

function build_eapi() {
    const handle_table = {
        mark_time : 'mark-time', 
        get_console_stdout : 'get-console-stdout',
        get_console_stderr : 'get-console-stderr',
        save : 'save',
        load : 'load',
        request_file_to_open : 'request-file-to-open',
        request_file_to_save : 'request-file-to-save',
        request_select_dir: 'request-select-dir',
        create_dir: 'create-dir',
        get_cwd: 'get-cwd',
        copy_file: 'copy-file',
        copy_dir: 'copy-dir',
        is_file_existing: 'is-file-existing',
        is_dir_existing: 'is-dir-existing',
        get_path_sep: 'get-path-sep',
        get_data_dir: 'get-data-dir',
        get_app_dir: 'get-app-dir',
        ensure_dir_exists : 'ensure-dir-exists',
        create_rendering_server : 'create-rendering-server',
        is_ws_available: 'is-ws-available'
    };
    
    for (const renderer_method_name in handle_table) {
        const backend_event_name = handle_table[renderer_method_name]; // type: string
        eapi[renderer_method_name] = (data) => ipcRenderer.invoke(backend_event_name, data);
    }
}

let eapi = { };
build_eapi();

contextBridge.exposeInMainWorld('eapi', eapi);