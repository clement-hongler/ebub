////////////////////////
// EVENT NAMES TABLE ///
////////////////////////

// {?} Add the possibility to put an arry of things for multishortcuts
const shortcuts_by_eco_event = {
    toggle_helper: 'meta+H',
    // toggle_default_zoom: 'meta+shift+Z',
    toggle_drawboard: 'meta+D',
    export_to_markdown_text: 'meta+shift+E', 
    export_ewo_to_html: 'meta+alt+E', export_selection_to_html: 'meta+shift+alt+E',
    export_ega_to_html: 'meta+E',
    zoom_in: 'meta+=', zoom_out: 'meta+-', zoom_canonical: 'meta+8',
    large_zoom_in: 'meta+shift+=', large_zoom_out: ['meta+shift+-', 'meta+shift+_'],
    toggle_prompt: 'meta+/', toggle_deep_edit: 'meta+\\', toggle_edata_edit: 'meta+0', toggle_xewo: 'meta+1', 
    switch_eco: 'meta+Tab', add_eco_file_path: 'meta+shift+L', // {?} switch_eco should become a much more exceptional thing
    toggle_ega_menu: 'meta+alt+M', toggle_eco_map: 'meta+shift+M', 
    sync_ewo_to_file: 'meta+shift+S', sync_ega_to_file: 'meta+shift+1', 
    timestamp_cur_ewo: 'meta+3', timestamp_cur_ega: 'meta+alt+3', 
    timestamp_red_ebu: 'meta+4', timestamp_selection: 'meta+alt+4', 
    // show_prev_todo_ebu: 'meta+5', show_next_todo_ebu: 'meta+shift+5',
    // sync_ewo_from_file_no_overwrite: 'meta+5', sync_ewo_from_file_no_overwrite: 'meta+alt+5',
    // sync_ega_from_file_no_overwrite: 'meta+6', sync_ega_from_file_overwrite: 'meta+alt+6', 
    // upsync_cur_ega: 'meta+6', upsync_cur_ega_with_overwrite: 'meta+shift+6',
    // upsync_all: 'meta+7', 
    bloom: 'meta+9', // {?} temporary, fun effect
    // file_up_sync: 'meta+U', file_upsync_overwrite: 'meta+shift+U', // {?} TEMPORARY SHORTCUT
    save: 'meta+S', save_snapshot_copy: 'meta+alt+S', local_upsync_overwrite: 'meta+shift+0', // {?} local_upsync_overwrite should later be the only save function
    new_ewo: 'meta+shift+N', new_blackboard_ewo: 'meta+shift+B', next_ewo_in_ega: 'meta+[', prev_ewo_in_ega: 'meta+]', // next ewo in gal, prev ewo in gal,
    next_ewo: 'meta+alt+[', prev_ewo: 'meta+alt+]', next_ega: 'meta+shift+[', prev_ega: 'meta+shift+]',
    // toggle_brush: 'meta+B', 
    toggle_label: 'meta+J',
    toggle_red_focus: 'Enter', deep_action: ['meta+Enter', 'meta+alt+Enter'], deep_toggle: 'meta+shift+Enter', deep_next: 'meta+;',   // newLink: 'meta+L',
    command_entered: 'alt+Enter', delete_ebu: 'meta+shift+Backspace', delete_eli: 'meta+Backspace',
    command_mode: 'meta+K', 
    move_across_history: 'meta+O', move_around_corners: 'meta+shift+O', 
    move_to_ebu: 'meta+shift+ ', 
    round_position: 'meta+P',
    new_ebu: 'meta+N',
    add_new_ega: 'meta+shift+G', next: 'Tab', prev: 'shift+Tab', 
    new_code_ebu: 'meta+shift+C', new_media_ebu: 'meta+shift+I', new_drawing_ebu: 'meta+shift+D',
    import_action: 'meta+I', smart_load: 'meta+L', smart_load_overwrite: 'meta+alt+L', 
    clear_alpha: 'Escape', 
    alpha_nav_next: 'meta+shift+.', alpha_nav_prev: 'meta+shift+,',
    alpha_local_nav_next: 'meta+.', alpha_local_nav_prev: 'meta+shift+,',  // {?} Temporary
    select_all: 'meta+A',
    ebu2vec: 'meta+2', suggest: 'meta+shift+2',  clear_suggest: 'shift+Escape', // {?} All temporary
    todo_navigate_bw: 'meta+T', todo_navigate_fw: 'meta+shift+T', // {?} temporary... should be something like meta+F + D
    prepare_cut_move: 'meta+X', prepare_copy_move: 'meta+C', execute_prepared_move: 'meta+V', execute_alt_move: 'meta+alt+V', toggle_grid: 'meta+G',
    toggle_baw_edit: 'meta+B',
    toggle_console: 'meta+shift+/'
};


const command_shortcuts_by_eco_event = { 
    toggle_clock: ['meta+C', 'C'], delete_ewo: ['meta+shift+Backspace'], delete_ega_deep: ['meta+alt+Backspace'], delete_ega: ['alt+Backspace'],
    collapse_cur_ega: ['meta+ArrowLeft'], expand_cur_ega: ['meta+ArrowRight'],
    zoom_in: ['I', 'meta+I'], zoom_out: ['O', 'meta+O'], next_ewo_in_ega: ['meta+J'], prev_ewo_in_ega: ['meta+F'],
    next_ega: ['meta+shift+J'], prev_ega: ['meta+shift+F'], sync_ega_to_file: ['meta+S'], toggle_edata_edit: ['E', 'meta+E'],
    toggle_deep_edit: ['meta+Enter'], toggle_prompt: ['meta+P'], suggest: ['meta+.'], toggle_attach: ['A', 'meta+A'],
    end_command: ['K', 'meta+K'], toggle_lock: ['L', 'meta+L'], set_main: ['M', 'meta+M'], toggle_baw_edit: ['B', 'meta+B'],
    upswap_ewo_in_ega: ['[', 'meta+['], downswap_ewo_in_ega: [']', 'meta+]'],
    upswap_ega: ['shift+[', 'meta+shift+['], downswap_ega: ['shift+]', 'meta+shift+]']
};

// applied by the drawboard in case we are in the drawboard mode
const shortcuts_by_drawboard_event = { 
    add_new_ellipse: 'E', add_new_rect: 'R', add_new_polyline: 'meta+L',
    add_new_polygon: 'shift+L', add_new_path: 'meta+', 
    add_new_point: 'P', add_new_point_backwards: 'shift+P',
    delete: 'meta+Backspace',
    delete_point: 'Backspace', delete_point_backwards: 'shift+Backspace', next: 'Tab', prev: 'shift+Tab',
    next_cyan: ' ', prev_cyan: 'shift+ '
};

// {?} we should move the relevant things here
// if we press right, we need to go left and if we press left, we need to go right
const shortcuts_by_emap_event = { 
    move_left_in_emap: 'ArrowRight', move_right_in_emap: 'ArrowLeft'
}; 

// {?} Could do a multi-map to put several commands into the same shortcut
function exchange_keys_and_multi_vals(dict) { let res = {}; for (const key in dict) for (const val of [dict[key] ?? []].flat()) res[val] = key; return res; }

const eco_events_by_shortcut = exchange_keys_and_multi_vals(shortcuts_by_eco_event);
const eco_events_by_command_shortcut = exchange_keys_and_multi_vals(command_shortcuts_by_eco_event);
const drawboard_events_by_shortcut = exchange_keys_and_multi_vals(shortcuts_by_drawboard_event);
const emap_events_by_shortcut = exchange_keys_and_multi_vals(shortcuts_by_emap_event);

// {?} HOW DO WE LOAD IMAGES

/////////////////////////
/// GENERIC CALLBACKS ///
/////////////////////////

async function on_resize() { } 

async function on_full_screen_change() { }

//////////////////////////
/// KEYBOARD CALLBACKS ///
//////////////////////////

let [prev_event, is_prev_command] = [undefined, false]; // {?} hacky
let is_default_zoom_on = false; // {?} hacky

// Returns null if the key_event.key_combination does not correspond to something in the event_names
function get_event({ key_combination = undefined }) { 
    if (prev_event != 'command_mode') return eco_events_by_shortcut[key_combination];
    if (prev_event == 'command_mode') return eco_events_by_command_shortcut[key_combination];
} 

function get_drawboard_event({ key_combination = undefined }) { return drawboard_events_by_shortcut[key_combination] }


async function on_key_down(key_event) {
    const event = get_event(key_event); // {?} Ultimately, we should make sure that event is always defined and skip if it isn't


    setTimeout(() => { if (event != undefined) prev_event = event }, 0); // will call as soon as we're done with the current function 
    
    if (event == 'end_command') { prev_event = undefined; return; } 


    if (eco?.is_xeco) { // {?} inelegant
        if (event == 'add_eco_file_path') { await on_add_eco_file_path(); return true; }
        if (event == 'add_new_eco_file_path') { await on_add_new_eco_file_path(); return true; } // {?} deprecated, to remove
        if (event == 'switch_eco') { await switch_eco(); return true; } // {?} to remove
    }
    const res = await eco.on_event(event, key_event); 
    if (res && event != undefined && eco.is_zen) preventDefault(key_event);  // {?} NOT ELEGANT AT ALL
} 

function preventDefault(key_event) { key_event.preventDefault() } // useful for tracing

async function on_key_up(key_event) { }

////////////////////////////
/// MOUSE EVENT HANDLERS ///
////////////////////////////

class MouseState { 
    constructor() { 
        this.is_mouse_pressed = false; 
        [this.temp_sel_rect, this.temp_sel_rect_dict] = [undefined, undefined];
        [this.sel_rect, this.sel_rect_dict] = [undefined, undefined]; 
    } 
    async on_mouse_down(mouse_event) { [this.is_mouse_pressed, this.mouse_down_x, this.mouse_down_y] = [true, mouse_event.x, mouse_event.y] }
    async on_mouse_move(mouse_event) {
        [this.mouse_move_x, this.mouse_move_y] = [mouse_event.x, mouse_event.y];
        if (this.is_mouse_pressed) {
            const [mdx, mdy, mmx, mmy, zl] = [this.mouse_down_x, this.mouse_down_y, this.mouse_move_x, this.mouse_move_y, eco.zoom_level];
            this.temp_sel_rect = point_pair_rect(mdx / zl, mdy / zl, mmx / zl, mmy / zl); 
            this.temp_sel_rect_dict = point_pair_rect_dict(mdx / zl, mdy / zl, mmx / zl, mmy / zl); // {?} can be simplified
        }
    }
    async on_mouse_up(mouse_event) {
        [this.mouse_up_x, this.mouse_up_y] = [mouse_event.x, mouse_event.y];
        if (this.is_mouse_pressed) {
            const [mdx, mdy, mux, muy, zl] = [this.mouse_down_x, this.mouse_down_y, this.mouse_up_x, this.mouse_up_y, eco.zoom_level];
            this.sel_rect = point_pair_rect(mdx / zl, mdy/ zl, mux / zl, muy / zl);
            this.sel_rect_dict = point_pair_rect_dict(mdx / zl, mdy/ zl, mux / zl, muy / zl); // {?} can be simplified
        }
        this.is_mouse_pressed = false;
    }
    async on_mouse_click(mouse_event) { this.last_click = { x: mouse_event.x / eco.zoom_level, y: mouse_event.y / eco.zoom_level }; }
}

const mouse_state = new MouseState();

///////////////////////
/// MOUSE CALLBACKS ///
///////////////////////

async function on_mouse_down(mouse_event) { 
    await mouse_state.on_mouse_down(mouse_event); 
    await eco.on_mouse_down(mouse_event, mouse_state); 
    if (eco.is_zen) mouse_event.preventDefault(); 
}
async function on_mouse_move(mouse_event) { 
    await mouse_state.on_mouse_move(mouse_event); 
    await eco.on_mouse_move(mouse_event, mouse_state); 
    if (eco.is_zen) mouse_event.preventDefault();
}
async function on_mouse_up(mouse_event) { 
    await mouse_state.on_mouse_up(mouse_event); 
    await eco.on_mouse_up(mouse_event, mouse_state); 
    if (eco.is_zen) mouse_event.preventDefault(); 
}
async function on_mouse_click(mouse_event) { 
    await mouse_state.on_mouse_click(mouse_event); 
    await eco.on_mouse_click(mouse_event, mouse_state); 
    if (eco.is_zen) mouse_event.preventDefault(); 
}

async function on_wheel(wheel_event) { await eco.on_wheel(wheel_event); /* wheel_event.preventDefault(); */ }

//////////////////////
/// LOAD FUNCTIONS ///
//////////////////////

async function on_load() { }

///////////////////////////
/// EVENT HANDLER SETUP ///
///////////////////////////

// Called in the index.js [the equivalent of the main]
function attach_event_handlers() {
    const wael = (event_name, callback) => window.addEventListener(event_name, callback);
    const dael = (event_name, callback) => document.addEventListener(event_name, callback);
    let [prev_key_down_event, prev_key_up_event] = [undefined, undefined];
	wael('resize', on_resize);
    wael('fullscreenchange', on_full_screen_change);

    dael('keydown', key_event => kes.on_key_down(key_event));
    dael('keyup', key_event => kes.on_key_up(key_event));

    dael('keydown', key_event => on_key_down(prev_key_down_event = annotate_key_event(key_event, prev_key_down_event)));
    dael('keyup', key_event => on_key_up(prev_key_up_event = annotate_key_event(key_event, prev_key_up_event)));
    dael('mousedown', on_mouse_down);
    dael('mouseup', on_mouse_up);
    dael('mousemove', on_mouse_move);
    dael('click', on_mouse_click);
    dael('load', on_load);
    dael('wheel', on_wheel);
}

/////////////////////////
/// UTILITY FUNCTIONS ///
/////////////////////////

// Annotates an event, by adding relevant things
function annotate_key_event(key_event, prev_key_event) {
    const { key, keyCode: key_code, charCode: char_code, shiftKey: shift_key, metaKey: meta_key, ctrlKey: ctrl_key, altKey: alt_key, code } = key_event;

    // make things compatible with snakeCase {?} useful down the line
    [key_event.meta_key, key_event.ctrl_key, key_event.shift_key, key_event.char_code, key_event.key_code, key_event.alt_key] 
    = [meta_key, ctrl_key, shift_key, char_code, key_code, alt_key];

    const [meta_or_ctrl_key, meta_and_ctrl_key] = [meta_key || ctrl_key, meta_key && ctrl_key];
    [key_event.meta_or_ctrl_key, key_event.meta_and_ctrl_key] = [meta_or_ctrl_key, meta_and_ctrl_key];
    const mod_state = (meta_and_ctrl_key ? 'double': '') + (meta_or_ctrl_key ? 'meta+': '') + (shift_key ? 'shift+':  '') + (alt_key ? 'alt+': '');
    const is_printable_key = key.length == 1; // small hack that works well
    key_event.is_printable_key = is_printable_key;

    let key_name = key;
    if (!is_printable_key) key_name = key;
    if (key_name.length == 1) key_event.is_prev_dead_key = undefined; 
    
    if (code.startsWith('Key') || code.startsWith('Digit')) key_name = code.charAt(code.length - 1);
    if (code == 'BracketLeft') key_name = '[';
    if (code == 'BracketRight') key_name = ']';
    key_event.key_combination = mod_state + key_name;

    key_event.prev_key_combination = prev_key_event?.key_combination; 
    if (key_event.prev_key_combination != key_event.key_combination) key_event.num_repeats = 0;
    else key_event.num_repeats = (prev_key_event?.num_repeats ?? 0) + 1; 
    
    [key_event.dir_x, key_event.dir_y] = [0, 0];
    if (key == 'ArrowLeft') key_event.dir_x = -1; if (key == 'ArrowRight') key_event.dir_x = 1;
    if (key == 'ArrowUp') key_event.dir_y = -1; if (key == 'ArrowDown') key_event.dir_y = 1;
    key_event.dir_v = new V(key_event.dir_x, key_event.dir_y);
    key_event.dir = { x: key_event.dir_x, y: key_event.dir_y };
    key_event.is_dir_key = (key_event.dir_x != 0 || key_event.dir_y != 0);

    key_event.game_dir = { x: 0, y: 0 }; // {?} is that a good name?
    if (code == 'KeyA') key_event.game_dir.x = -1; if (code == 'KeyD') key_event.game_dir.x = 1;
    if (code == 'KeyW') key_event.game_dir.y = -1; if (code == 'KeyS') key_event.game_dir.y = 1;
    key_event.is_game_dir_key = (key_event.game_dir.x != 0 || key_event.game_dir.y != 0);

    key_event.is_printable_key = is_printable_key;
    
    key_event.adj_text = (text, allow_multispace=false) => {
		if (meta_key) return text;        
		if (key == 'Backspace' && text.length > 0) {
			if (alt_key) { let n = text.lastIndexOf(" "); if (n == -1) return ""; else return text.slice(0, n); }
			return text.slice(0, -1);
		}

        if (kes.is_accented_key != undefined) return text + kes.is_accented_key;
		if (key == ' ') { if (allow_multispace || (text.length > 0 && last(text) != ' ')) return text + key; else return text; }
		else if (is_printable_key && !meta_or_ctrl_key) return text + key; // small hack to detect alphanumeric keys

		// if we don't recognize the key, leave the text as it
		return text;
	};

    const { key_combination } = key_event;

    return key_event;
}


function annotateMouseEvent(mouse_event) {}

////////////////////////////////////////////////////
/// KEY STATE (AUXILIARY TO OTHER KEY FUNCTIONS) ///
////////////////////////////////////////////////////

class Kes {
    constructor() { 
        this.dead_key = this.is_accented_key = this.isShiftDown = this.isMetaDown = this.isAltDown = false;
        this.beats = { shift: 0, meta: 0, alt: 0 };
        this.prevBeats = { shift: 0, meta: 0, alt: 0 };
    }

    on_key_down({ key, code, keyCode, charCode, shift_key, metaKey, altKey }) {
        charCode ||= keyCode;
        const is_printable_key = key.length == 1; // small hack that works well

        [this.isShiftDown, this.isMetaDown, this.isAltDown] = [shift_key, metaKey, altKey];

        // get_accented_key is defined in common.js
        this.is_accented_key =  (this.dead_key != undefined && is_printable_key) ? get_accented_key(this.dead_key, charCode, shift_key, key): undefined;

        // saves the dead_key for the next keyDown event
        if (key == 'Dead') {
            if (code == 'KeyE' || (charCode == 222 && !shift_key)) this.dead_key = 'acute';
            if (code == 'Backquote' || (charCode == 192 && !shift_key)) this.dead_key = 'grave';
            if (code == 'KeyU' || (charCode == 222 && shift_key)) this.dead_key = 'umlaut';
            if (code == 'KeyI' || (charCode == 54 && shift_key)) this.dead_key = 'hat';
            if (code == 'KeyN') this.dead_key = 'tilde';
        }
        else if (is_printable_key) { this.dead_key = undefined; } // only cancel the dead_key if the char is printable, otherwise keep it
    }

    on_key_up({ shift_key, metaKey, altKey }) { [this.isShiftDown, this.isMetaDown, this.isAltDown] = [shift_key, metaKey, altKey] }

    beat() { // {?} needs a more reliable update of the isShiftDown, isMetaDown, isAltDown
        const stateDict = { shift: this.isShiftDown, meta: this.isMetaDown, alt: this.isAltDown };
        for (const key in this.beats) this.prevBeats[key] = this.beats[key];
        for (const key in this.beats) this.beats[key] = stateDict[key] ? this.beats[key] + 1 : 0;
    }
}

const kes = new Kes(); 
setInterval(() => kes.beat(), 100);