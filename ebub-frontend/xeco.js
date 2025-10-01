///////////////////////////////////////
/// EXCHANGE-MAKING EXTERNAL COSMOS ///
//////////////////////////////////////////////////////////////////////////
/// The version of the eco with all the user interface and the backend ///
/// (including in particular a prompt)                                 ///
//////////////////////////////////////////////////////////////////////////



class Xeco extends Eco { 
    constructor(dict, file_path, parent_div) {
        super(dict, parent_div);
        this.is_xeco = true; // this being true says we are in edit mode (rather than view mode)
        this.file_path = file_path;
        this.xewo = new Xewo(this); // external ewo terminal, defined in terminal.js (appends itself to the div)
        this.console = new Console(parent_div);
        this.show_clock = true;
        this.show_progress = true;
        this.main_client = new Client({ address: '127.0.0.1', port: 9723 }); // used to sync with the local server, etc
        this.sync_clients_by_address = {}; // all the clients to sync the various egas with
    }

    // called by the parent
    init_div(parent_div) {
        super.init_div(parent_div); // creates the this.div and populates it
        this.init_clock_div();
        this.init_progress_div(); 
        this.init_deep_text_area(); this.init_edata_editor_div(); 
        this.init_prompt_div(); this.init_sel_rect_div(); this.init_grid();
        this.init_drawboard();
    }

    init_clock_div() { this.clock_div = new_child_div(this.div, { z: 128 }); }

    init_progress_div() { this.progress_div = new_child_div(this.div, { z: 128, fsp: 20 }); }

    init_deep_text_area() {

        this.deep_text_area = new_child_elem('textarea', this.div, deep_text_sd); // defined in appearance.js
        this.deep_text_area.addEventListener('keydown', (event) => this.on_deep_text_area_key_down(event));
        this.deep_text_area.addEventListener('input', (event) => this.on_deep_text_area_input(event));
        hide_elem(this.deep_text_area);
    }

    init_edata_editor_div() {
        const edata_editor_style_dict = { z: 256, bg: '#002255', fg: '#ffffff', fsp: 13, y: 32, w: 256, h: 256 }; // {?} to be changed
        this.edata_editor_div = new_child_div(this.div, edata_editor_style_dict);
        this.efield_div = new_child_div(this.edata_editor_div, { x: 0, y: 0, w: 128, h: 32, padding_left: 8.5, padding_top: 4 });
        this.efield_val = new_child_elem('input', this.edata_editor_div, { x: 128, y: 0, w: 128, h: 32 - 4, border_width: 0, padding_top: 0, padding_bottom: 0, fg: '#ffffff', bg: '#002255', resize: 'None', z : 384, fsp: 13 }, true);
        hide_elem(this.edata_editor_div);
    }

    init_grid() {
        this.grid_div = new_child_div(this.div, { z: -512, bg: '#00000000', x: 0, y: 0, ... this.screen_size_dict });
        const grid_dicts = [{ spacing: 16, stroke_color: '#00aaff44' }, { spacing: 64, stroke_color: '#cccccc44' }, { spacing: 512, stroke_color: '#ffffff44' }];
        this.grid_svgs = grid_dicts.map(grid_dict => new SmartGrid(grid_dict, this.grid_div));
        this._is_grid_visible = false;
    }

    init_prompt_div() {
        const style_dict = { x: 0, y: 0, wpc: 100, z: 1024, font_family: 'Courier', ... input_padding_dict }; // input_padding_dict in appearance.js
        this.prompt_div = new_child_div(this.div, { ... style_dict, hpc: 100 });
        this.prompt_text_area = new_child_elem('textarea', this.prompt_div, { ... style_dict, h: 32 });
        this.prompt_text_area.value = "";
        this.psug = new Psug(this, this.prompt_div);
    }

    init_sel_rect_div() {
		this.sel_rect_div = new_child_div(document.body, {}, false);
		adj_elem(this.sel_rect_div, { z: 256, border_color: '#cccccc', bg: '#00224499' });
		hide_div(this.sel_rect_div);
	}

    init_drawboard() { this.drawboard = new DrawBoard(this); this.is_in_draw_mode = false; }

    //////////////////////
    /// ACCESS METHODS ///
    //////////////////////

    get is_prompt_visible() { return this._is_prompt_visible ?? false }
    set is_prompt_visible(_is_prompt_visible) { this._is_prompt_visible = _is_prompt_visible; this.refresh_lf(); }

    get is_zen() { return !this.is_in_deep_edit && !this.xewo.is_visible }

    get is_in_deep_edit() { return this._is_in_deep_edit ?? false }
    set is_in_deep_edit(_is_in_deep_edit) { this._is_in_deep_edit = _is_in_deep_edit; this.refresh_lf(); }

    get is_in_edata_edit() { return this._is_in_edata_edit ?? false }
    set is_in_edata_edit(_is_in_edata_edit) { this._is_in_edata_edit = _is_in_edata_edit; this.refresh_lf(); }

    get is_in_xewo_mode() { return this.xewo.is_visible }
    set is_in_xewo_mode(_is_in_xewo_mode) { this.xewo.is_visible = _is_in_xewo_mode }

    get is_in_baw_edit() { return this._is_in_baw_edit ?? false }
    set is_in_baw_edit(_is_in_baw_edit) { this._is_in_baw_edit = _is_in_baw_edit; this.refresh_lf(); }

    get is_in_ewo_fw_mode() { return super.is_in_ewo_fw_mode && !this.is_prompt_visible } // called by the parent

    get red_ebu() { return this.cur_ewo?.red_ebu } // can be undefined
    get green_ebu() { return this.cur_ewo?.green_ebu }
    get blue_ebu() { return this.cur_ewo?.blue_ebu }

    get red_bid() { return this.cur_ewo?.red_bid } // can be undefined
    get green_bid() { return this.cur_ewo?.green_bid }
    get blue_bid() { return this.cur_ewo?.blue_bid }

    get selection_ebus() { return this.cur_ewo?.selection_ebus ?? [] }

    get query_ref_dict() { 
        return { 
                wid: this.cur_wid, red_bid: this.red_bid, green_bid: this.green_bid, blue_bid: this.blue_bid, 
                red_ebu: this.red_ebu?.to_dict(), green_ebu: this.green_ebu?.to_dict(), blue_ebu: this.blue_ebu?.to_dict() 
            } 
    } // undef will be ignored

    get is_grid_visible() { return this._is_grid_visible ?? false }
    set is_grid_visible(_is_grid_visible) { this._is_grid_visible = _is_grid_visible; this.refresh_lf(); }

    get is_in_overwrite_mode() { return this._is_in_overwrite_mode ?? false }
    set is_in_overwrite_mode(_is_in_overwrite_mode) { this._isIsInOverwriteMode = _is_in_overwrite_mode ?? false }

    get front_ewo() { return this.is_in_xewo_mode ? this.xewo : this.cur_ewo }

    get is_drawboard_visible() { return this.drawboard.is_visible }
    set is_drawboard_visible(_is_drawboard_visible) { this.drawboard.is_visible = _is_drawboard_visible }

    ///////////////////////////////
    /// DISPLAY AND EVO METHODS ///
    ///////////////////////////////

    evo_hf(is_deep = true) { super.evo_hf(is_deep); if (this.is_drawboard_visible) this.drawboard.evo_hf(); if (is_deep) this.xewo.evo_hf(); }
    evo_lf(is_deep = true) { super.evo_lf(is_deep); if (is_deep) { this.main_client.evo_lf(); this.xewo.evo_lf(); } }
    refresh_hf(is_deep = true) { 
        if (this.is_drawboard_visible) this.drawboard.refresh_hf();
        super.refresh_hf(is_deep); this.refresh_clock_hf(); this.refresh_progress_hf(); this.refresh_grid_hf(); if (is_deep) this.xewo.refresh_hf(); 
    }

    refresh_lf(is_deep = true) { 
        super.refresh_lf(is_deep); this.refresh_clock_lf(); this.refresh_progress_lf(); 
        this.refresh_grid_lf(); this.refresh_deep_edit_lf(); this.refresh_edata_edit_lf();
        if (is_deep) this.xewo.refresh_lf(); this.refresh_prompt_lf();
    }

    refresh_grid_hf() {
        if (!this.cur_ewo) return;
        for (let grid_svg of this.grid_svgs) grid_svg.update_grid(this.cur_ewo.obs_soft_pos, this.screen_size_dict);
    }

    refresh_grid_lf() { 
        const show_grid = this.is_grid_visible && this.cur_ewo != undefined;
        adj_elem_visibility(this.grid_div, show_grid);
        if (!show_grid) return; 
        const { w, h } = this.screen_size_dict; 
        for (let grid_svg of this.grid_svgs) { adj_elem(this.grid_div, { w, h }); [grid_svg.w, grid_svg.h] = [w, h]; }
    }

    refresh_clock_hf() { adj_elem(this.clock_div, { x: this.screen_width - 96, y: 4 }); } 

    refresh_clock_lf() {
        adj_elem(this.clock_div, { fg: (this.main_client.is_connected ? colors.cyan : colors.magenta )});
        adj_elem_visibility(this.clock_div, this.show_clock); this.clock_div.innerHTML = get_hour_minute_time();
    }

    refresh_progress_lf() {
        adj_elem(this.progress_div, { fg: colors.yellow, y: 4, x: 8 });
        adj_elem_visibility(this.progress_div, (this.cur_ewo?.is_in_progress ?? false) && this.show_progress);
        this.progress_div.innerHTML = this.cur_ewo ? (this.cur_ewo.done + "/" + this.cur_ewo.todo) : '';
    }

    refresh_progress_hf() {
    }

    refresh_prompt_lf() {
        const adjustment_dict = { w: this.screen_width - 8, h: 32, resize: 'none', z: 1000000000 };
        adj_elem(this.prompt_div, { wpc: 100, hpc: 100, resize: 'none', bg: '#44000033' }); 
        this.psug.refresh_lf();
        adj_elem(this.prompt_text_area, adjustment_dict);
        adj_elem_visibility(this.prompt_div, this.is_prompt_visible);
    }

    refresh_deep_edit_lf() { 
        const show_deep_edit = this.is_in_deep_edit && (this.red_ebu != undefined);
        if (show_deep_edit) {
            const rect_dict = this.red_ebu.screen_rect_dict;
            const step = 32;
            const { w, h } = this.screen_size_dict; 
            while (rect_dict.x < 0) rect_dict.x += step;
            while (rect_dict.y < 0) rect_dict.y += step;
            while (rect_dict.x + rect_dict.w > w) rect_dict.x -= step;
            while (rect_dict.y + rect_dict.h > h) rect_dict.y -= step; 
            rect_dict.w -= 13; // {?} magic number that seems to fix everything... but obviously needs to be written cleaner
            adj_elem(this.deep_text_area, rect_dict);
            const padding_left = this.red_ebu.is_indented ? 17 : 10.5; // {?} magic numbers...
            adj_elem(this.deep_text_area, { padding_left, padding_right: 0 });
        }
        adj_elem_visibility(this.deep_text_area, show_deep_edit); 
    }

    refresh_edata_edit_lf() { 
        const show_edata_edit = this.is_in_edata_edit && (this.red_ebu != undefined);
        const efield_key_width = 128;
        if (show_edata_edit && this.red_ebu.cur_e_field != undefined) {
            let { x, y, w, h } = this.red_ebu.screen_rect_dict;
            adj_elem(this.edata_editor_div, { x, y: y - 32, h: 32, w: Math.max(3 * efield_key_width, w) });
            this.efield_div.innerHTML = this.red_ebu.temp.cur_e_field ?? '[no efield]';
            show_elem(this.efield_val);
            adj_elem(this.efield_val, { x: efield_key_width, y: 0, w: Math.max(efield_key_width, w - efield_key_width), h: 32 - 4 });
            this.efield_val.focus();
        }
        else if (show_edata_edit) { // 
            let { x, y, w, h } = this.red_ebu.screen_rect_dict;
            adj_elem(this.edata_editor_div, { x, y: y - 32, h: 32, w });
            hide_elem(this.efield_val);
        } 
        adj_elem_visibility(this.edata_editor_div, show_edata_edit); 

    } // {?} to complete

    ///////////////////////
    /// SYNCHRONIZATION ///
    ///////////////////////

    add_new_sync_client({ address, port }) {
        if (!(address in this.sync_clients_by_address)) this.sync_clients_by_address[address] = new Client({ address, port });
        return this.sync_clients_by_address[address];
    }

    add_new_ega_from_dict(ega_dict) {
        (ega_dict?.sync_addresses ?? []).forEach(address => this.add_new_sync_client({ address, port: 9723 })); // {?} a bit hacky
        return super.add_new_ega_from_dict(ega_dict);
    }

    /////////////////////
    /// EVENT METHODS ///
    /////////////////////


    async on_event(event, key_event){ // overloads parent eco method
        const front_ewo = this.front_ewo; 
        // {?} Should harmonize with the ewo on_event
        this.activate_hf_mode(); // toggles the high refresh mode // called in the parent
        this.evo_and_refresh_lf_soon();            
        if (event == 'toggle_drawboard') return await this.on_toggle_drawboard();
        // {?} a bit ugly
        if (this.is_drawboard_visible) return await this.drawboard.on_event(get_drawboard_event(key_event), key_event);
        if (event == 'next' && this.is_prompt_visible) {
            this.psug.make_psugs();
        }
        if (event == 'toggle_baw_edit') return this.on_toggle_baw_edit();
        if (event == 'toggle_grid') return await this.on_toggle_grid();
        if (event == 'toggle_clock') return await this.on_toggle_clock();
        if (event == 'toggle_prompt') return await this.on_toggle_prompt(); 
        if (event == 'toggle_console') return await this.on_toggle_console();
        if (event == 'toggle_xewo') return await this.on_toggle_xewo(); // toggles the exchange world

        if (event == 'deep_action' && this.is_prompt_visible) return this.on_prompt_entered();
        if (event == 'deep_action' && this.is_in_deep_edit) { return this.on_toggle_deep_edit() }
        if (event == 'deep_action' && this.is_in_edata_edit) { return this.on_toggle_edata_edit() }
        if (event == 'deep_action' && this.is_in_xewo_mode) { return this.on_ask_for_suggestions(); }

        if (event == 'deep_action' && !this.is_prompt_visible) {
            const [red_ebu, green_ebu] = [front_ewo?.red_ebu, front_ewo?.green_ebu];
            if (all_defined(front_ewo, red_ebu, green_ebu)) { const res = front_ewo.on_new_eli(green_ebu, red_ebu); front_ewo.green_bid = undefined; return res; }
        }

        // if (event == 'todo_navigate') return this.on_worker_at_query('@todo-find', []);
        if (event == 'todo_navigate_fw') return this.on_todo_navigate(+1);
        if (event == 'todo_navigate_bw') return this.on_todo_navigate(-1);

        if (event == 'deep_next') {  if (all_defined(front_ewo, front_ewo.red_ebu)) return front_ewo.on_new_ebu_with_eli_from_red(); return false; } 
        
        if (event == 'upswap_ewo_in_ega') { this.cur_ega?.upswap_cur_wid(); return true; }
        if (event == 'downswap_ewo_in_ega') { this.cur_ega?.downswap_cur_wid(); return true; }

        if (event == 'upswap_ega') { this.swap_gid(this.cur_gid, -1); return true; }
        if (event == 'downswap_ega') { this.swap_gid(this.cur_gid, 1); return true; }


        if (!this.emap.is_visible) {
            if (event == 'new_ewo' && key_event.num_repeats == 2) return this.on_new_ewo(this.cur_ega);
            if (event == 'new_blackboard_ewo' && key_event.num_repeats == 2) return this.on_new_blackboard_ewo();
            if (event == 'add_new_ega' && key_event.num_repeats == 2) return this.on_new_ega();
            if (front_ewo && !front_ewo.is_view_only) {
                if (this.is_in_baw_edit) {
                    if (front_ewo.baw.on_event(event, key_event)) return true;
                    else if (key_event.is_dir_key) return front_ewo.on_event(event, key_event);
                }
                else {
                    if (event == 'new_ebu') return front_ewo.on_new_ebu();
                    if (event == 'new_code_ebu') return front_ewo.on_new_ebu({ type: 'code' });
                    if (event == 'new_media_ebu') return front_ewo.on_new_ebu({ type: 'media' });
                    if (event == 'new_drawing_ebu') return front_ewo.on_new_ebu({ type: 'draw' });
                    if (event == 'new_video_ebu') return front_ewo.on_new_ebu({ type: 'video' });
                    if (event == 'delete_ebu') return front_ewo.on_remove_red_ebu();
                    if (event == 'delete_eli') return front_ewo.on_remove_green_to_red_eli();
                }
            }
            if (event == 'toggle_deep_edit' && !this.is_in_edata_edit) return this.on_toggle_deep_edit(); 
            if (event == 'toggle_edata_edit' && !this.is_in_deep_edit) return this.on_toggle_edata_edit(); 
            if (event == 'clear_alpha') return this.on_clear_alpha();
            if (event == 'alpha_local_nav_next') return this.on_alpha_nav(+1, false);
            if (event == 'alpha_local_nav_next') return this.on_alpha_nav(+1, false);
            if (event == 'alpha_nav_next') return this.on_alpha_nav(+1, true);
            if (event == 'alpha_nav_prev') return this.on_alpha_nav(-1, true);
        }

        if (event == 'set_main') return this.on_set_cur_ewo_main();

        if (event == 'smart_load') await on_smart_load(this, false); // in sync.js
        if (event == 'smart_load_overwrite') return await on_smart_load(this, true); // in sync.js

        if (event == 'save') return await on_save_eco(this);
        if (event == 'save_snapshot_copy') return await on_save_snapshot_copy(this); // in sync.js
        if (event == 'local_upsync_overwrite') return this.on_local_upsync_overwrite(); // {?} will later replace the save mechanism
        if (event == 'upsync_all') return this.on_upsync_all(); 
        if (event == 'command_entered' && !this.xewo.is_visible) return this.xewo.on_make_input(this.red_ebu, this.green_ebu); 
        
        if (event == 'sync_ega_to_file') return await on_sync_cur_ega_to_json_file(this); 
        if (event == 'sync_ewo_to_file') return await on_sync_cur_ewo_to_json_file(this); 
        
        if (event == 'file_upsync') return await this.on_file_upsync(false);
        if (event == 'file_upsync_with_overwrite') return await this.on_file_upsync(true);

        if (event == 'load_from_file_without_overwrite') return await this.on_load_from_file(false);
        if (event == 'load_from_file_with_overwrite') return await this.on_load_from_file(true);

        if (event == 'sync_ega_from_file_no_overwrite') return await this.on_sync_ega_from_file(false);
        if (event == 'sync_ega_from_file_overwrite') return await this.on_sync_ega_from_file(true);

        if (event == 'sync_ewo_from_file_no_overwrite') return await this.on_sync_ewo_from_file(false);
        if (event == 'sync_ewo_from_file_no_overwrite') return await this.on_sync_ewo_from_file(true);

        if (event == 'upsync_cur_ega') return await this.on_upsync_cur_ega(false); 
        if (event == 'upsync_cur_ega_with_overwrite') return await this.on_upsync_cur_ega(true);

        if (event == 'ebu2vec') return this.on_ebu_2_vec();
        if (event == 'export_to_markdown_text') return await on_export_cur_ewo_to_md_text(this); 
        if (event == 'export_ewo_to_html') return await on_export_ewo_to_html(this, false); 
        if (event == 'export_ega_to_html') return await on_export_ega_to_html(this);
        if (event == 'export_selection_to_html') return await on_export_ewo_to_html(this, true);
        
        if (event == 'select_all') return true; // {?} to be implemented

        if (!this.is_in_deep_edit) {
            if (event == 'prepare_copy_move') return this.on_prepare_copy_move();
            if (event == 'prepare_cut_move') return this.on_prepare_cut_move();
            if (event == 'execute_prepared_move') return this.on_execute_prepared_move();
            if (event == 'execute_alt_move') return this.on_execute_alt_move();
        }

        if (event == 'timestamp_selection') return await on_timestamp_selection(this);
        if (event == 'timestamp_red_ebu') return await on_timestamp_red_ebu(this);
        if (event == 'timestamp_cur_ewo') return await on_timestamp_cur_ewo(this);
        if (event == 'timestamp_cur_ega') return await on_timestamp_cur_ega(this);

        if (event == 'bloom') return this.on_bloom();

        if (this.xewo.is_visible) if (await this.xewo.on_event(event, key_event)) return true;

        if (this.is_in_deep_edit) return false;
        if (this.is_in_edata_edit) return this.on_edata_edit_event(event, key_event);
        // This is where the ewo forwarding occurs (if applicable) 
        return await super.on_event(event, key_event); // parent eco method by default
    }

    async on_mouse_down(mouse_event, mouse_state) { // should intercept events
        if (mouse_event.altKey) return true;
        if (this.cur_ewo && this.is_in_baw_edit) return this.cur_ewo.baw.on_mouse_down(mouse_event, mouse_state);
        show_div(this.sel_rect_div); adj_elem(this.sel_rect_div, { x: 0, y: 0, w: 0, h: 0 });
        this.refresh_lf();
        return super.on_mouse_down(mouse_event, mouse_state); 
    }
    async on_mouse_move(mouse_event, mouse_state) { 
        if (mouse_event.altKey) return true;
        if (this.cur_ewo && this.is_in_baw_edit) return this.cur_ewo.baw.on_mouse_move(mouse_event, mouse_state);
        if (mouse_state.temp_sel_rect != undefined) adj_elem(this.sel_rect_div, mouse_state.temp_sel_rect_dict); 
		else hide_div(this.sel_rect_div); 
        return super.on_mouse_move(mouse_event, mouse_state); 
    }
    async on_mouse_up(mouse_event, mouse_state) {
        if (mouse_event.altKey) return true;
        if (this.cur_ewo && this.is_in_baw_edit) return this.cur_ewo.baw.on_mouse_up(mouse_event, mouse_state);

        hide_div(this.sel_rect_div);
        if (this.front_ewo?.on_mouse_up(mouse_event, mouse_state)) return true;
        else return super.on_mouse_up(mouse_event, mouse_state); 
    }
    async on_mouse_click(mouse_event, mouse_state) {
/*        const ebus = this.cur_ewo?.getEbusAtScreenLoc({ x: mouse_state.mouse_down_x, y: mouse_state.mouse_down_y });
        if (mouse_event.altKey && !mouse_event.shiftKey) ebus.forEach(ebu => this.add_to_alpha(ebu));
        if (mouse_event.altKey && mouse_event.shiftKey) ebus.forEach(ebu => this.remove_from_alpha(ebu));
*/
        if (this.cur_ewo && this.is_in_baw_edit) return this.cur_ewo.baw.on_mouse_click(mouse_event, mouse_state);
        return await super.on_mouse_click(mouse_event, mouse_state);
    }

    async on_toggle_prompt() {
        this.is_prompt_visible ^= true;
        if (this.is_prompt_visible) { this.prompt_text_area.focus(); }
        return true;
    }

    async on_toggle_console() {
        this.console.is_visible ^= true;
        return true;
    }

    async on_toggle_xewo() {
        this.is_in_xewo_mode ^= true; 
        if ((this.is_in_xewo_mode && !this.is_prompt_visible) || (!this.is_in_xewo_mode && this.is_prompt_visible)) this.on_toggle_prompt(); 
        return true;
    }

    async on_toggle_drawboard() { this.is_drawboard_visible ^= true; return true; }

    async on_prompt_entered() {
        const prompt_command = this.prompt_text_area.value; this.on_prompt_command(prompt_command); 
        this.prompt_text_area.value = ""; this.is_prompt_visible = false;
        return true;
    }

    // Called when a prompt command is entered
    // {?} Should be made much more concise, and should also be offloaded to keyboard shortcuts
    // {?} Could be merged with events, perhaps
    // {?} Perhaps could be split into a command for the ewo and one for the ega
    async on_prompt_command(prompt_command) {
        const prompt_words = prompt_command.split(' ').filter(word => word != '');
        if (prompt_words.length > 0) {
            const [first_word, second_word, tail_words] = [prompt_words[0], prompt_words[1], prompt_words.filter((_, i) => i > 0)]; // undefined is ok
            if (first_word?.charAt(0) == '@') return this.on_worker_at_query(first_word, tail_words);
            
            const prompt_handlers_by_first_word = {
                name: this.on_rename_cur_ewo, rename: this.on_rename_cur_ewo, ewo: this.on_rename_cur_ewo,
                info: this.on_show_info 
            };




            // {?} should be completed, then treated to have the multiply keys dispatched, then uniformize the handler's form, 
            // then make a helper page for the handlers

            // {?} should be replaced by a dictionary of functions
            switch (first_word) {
                case 'name': case 'rename': case 'name-ewo': case 'rename-ewo': case 'ewo': return this.on_rename_cur_ewo(second_word);
                case 'info': return this.on_show_info();
                case 'ega': case 'name-ega': case 'rename-ega': return this.on_rename_cur_ega(second_word);
                case 'tag': return this.on_tag_cur_ewo(second_word);
                case 'untag': return this.on_untag_cur_ewo(second_word);
                case 'ega-tag': return this.on_tag_cur_ega(second_word);
                case 'ega-untag': return this.on_untag_cur_ega(second_word);
                case 'attach': return this.on_attach_cur_ewo(second_word);
                case 'detach': return this.on_detach_cur_ewo(second_word);
                case 'add-sync': return this.on_add_sync_address(second_word);
                case 'rem-sync': return this.on_remove_sync_address(second_word);
                case 'set-main': return this.on_set_cur_ewo_main(second_word); // sets the cur_ewo as the main of cur_ega
                case 'find': return this.on_find(second_word, prompt_words.slice(1)); 
                case 'rem-ewo': return this.on_remove_cur_ewo();
                case 'rem-ega': return this.on_remove_cur_ega(false);
                case 'rem-ega-deep': return this.on_remove_cur_ega(true);
                case 'alpha-flow': return this.on_alpha_flow(second_word);
                case 'downsync': return await this.on_down_sync_ega(second_word, this.cur_ega?.name, false);
                case 'downsync-overwrite': return await this.on_down_sync_ega(second_word, this.cur_ega?.name, true);
                case 'upsync': return await this.on_upsync_cur_ega(false);
                case 'upsync-overwrite': return await this.on_upsync_cur_ega(true);
                case 'file-upsync': return await this.on_file_upsync(false);
                case 'file-upsync-overwrite': return await this.on_file_upsync(true);
                case 'sync-from-file': return await this.on_sync_ega_from_file(false);
                case 'sync-from-file-overwrite': return await this.on_sync_ega_from_file(true);
                case 'ega-to-file': return await this.on_sync_cur_ega_to_file();
                case 'ewo-to-file': return await this.on_cur_cur_ewo_to_file();
                case 'nav-to-ewo': return this.on_nav_to_ewo(second_word);
                case 'nav-to-ega': return this.on_nav_to_ega(second_word);
                case 'move-to-ega': return this.on_move_cur_ewo_to_ega(second_word);
                case 'alpha-find': return this.on_alpha_find(tail_words);
                case 'code': await save_ega_codes(this, this.cur_ega); return true;
                case 'clock': return this.on_toggle_clock();
                case 'ebu2vec': return this.on_ebu_2_vec();
                case 'worker-reload': return this.on_worker_reload();
                case 'show': case 'show-start': return this.on_show_start();
                case 'show-stop': return this.on_show_stop();
                case 'zoom-in': return this.on_zoom(this.zoom_facts_by_event['zoom_in']);
                case 'zoom-out': return this.on_zoom(this.zoom_facts_by_event['zoom_out']);
                case 'zoom-canonical': return this.on_set_zoom(next_val_circ(this.zoom_canonical_vals, this.zoom_level));
                case 'progress': return this.on_progress(second_word, tail_words.slice(1));
                case 'todo': return this.on_progress('todo', tail_words);
                case 'done': return this.on_progress('done', tail_words);
                case 'view': case 'view-only': return this.on_view_only();
                case 'edit': case 'edit-mode': return this.on_edit_mode();
            }
        }
        return false;
    }

    // {?} Should be handled as prompt events in a centralized way
    on_rename_cur_ewo(ewo_name) { 
        if (!this.cur_ewo) return false; 
        if (this.find_ewo_by_name(ewo_name, true) != undefined) { // if there is already an ewo named like that in the cur ega
            this.post_status(`Ewo name ${ewo_name} already exists in ega ${this.cur_ega.name}`); return false; 
        }

        this.cur_ewo.name = ewo_name; 
        this.cur_ewo.refresh_lf(); this.post_status(`World name: ${ewo_name}`); 
        this.emap.reconstruct_soon();
        return this.on_upsync_cur_ewo(); 
    }

    // {?} Should be handled as prompt events
    on_rename_cur_ega(ega_name) { 
        if (!this.cur_ega) { this.post_status("Cannot change current ega's name: not currently in an ega"); return false; } 
        if (this.find_ega_by_name(ega_name) != undefined) { this.post_status(`Ega name ${ega_name} already exists`); return false; }

        this.cur_ega.name = ega_name; this.refresh_lf(); this.cur_ewo?.refresh_lf(); 
        this.post_status(`Ega name: ${ega_name}`); 
        this.emap.reconstruct_soon();
        return this.on_upsync_cur_ega();
    }

    on_show_info() {
        const ewo = this.cur_ewo, ebu = this.red_ebu;
        let info = '';
        if (ebu != undefined) info += `bid: ${ebu.bid}, created: ${ebu.get_creation_date()}, last modified: ${ebu.get_last_mod_date()}, labels: [${ebu.labels.join(' ')}]`;
        else if (ewo != undefined) info += `wid: ${ewo.wid}, name: ${ewo.name}, egas: ${this.get_egas_by_wid(ewo.wid).map(ega => ega.name).join(' ')}`;
        this.post_status(info);       
        return true;    
    }

    on_attach_cur_ewo(ega_name) { 
        if (!this.cur_ewo) return false; 
        this.egas.filter(ega => ega.name == ega_name).forEach(ega => ega.attach_ewo(this.cur_ewo)); 
        this.post_status(`Attached current world to ega with name=${ega_name}`);
        return true; 
    }

    on_detach_cur_ewo(ega_name) { 
        if (!this.cur_ewo) return false; 
        ega_name ??= this.cur_ega?.name;
        this.egas.filter(ega => ega.name == ega_name).forEach(ega => ega.detach_ewo(this.cur_ewo)); 
        this.post_status(`Detached current world from ega with name=${ega_name}`);
        return true; 
    }

    on_add_sync_address(address) { 
        this.cur_ega?.add_sync_address(address); 
        this.add_new_sync_client({ address, port: 9723 }); // {?} HACKY
        this.post_status(`Added sync ${address} to (${this.cur_ega?.name})`); return true; }   

    on_remove_sync_address(address) { this.cur_ega?.remove_sync_address(address); this.post_status(`Removed sync ${address} from (${this.cur_ega?.name})`);return true; }

    get_cur_sync_clients() {
        const remote_sync_clients = (this.cur_ega?.sync_addresses ?? []).map(sync_address => this.sync_clients_by_address[sync_address]).filter(client => client != undefined);
        if (remote_sync_clients.length > 0) console.log(`We have ${remote_sync_clients.length} remote sync clients`);
        const cur_sync_clients = [this.main_client, ... remote_sync_clients];
        return cur_sync_clients;
    }

    on_set_cur_ewo_main(second_word) { 
        if (!this.cur_ewo || !this.cur_ega) return false; 
        this.cur_ega.main_wid = this.cur_ewo.wid; 
        this.post_status(`Set current world (${this.cur_ewo.name}) as main of current ega (${this.cur_ega.name}).`);
        return true; 
    }

    on_tag_cur_ewo(tag) {
        if (!this.cur_ewo) return false;
        if (this.cur_ewo.tags.includes(tag)) return true; // or is it false? not very clear 
        this.cur_ewo.tags.push(tag); // we add the tag at the end of the list
        this.cur_ewo.refresh_lf();
        return true;
    }

    on_untag_cur_ewo(tag) {
        if (!this.cur_ewo) return false; const tag_index = this.cur_ewo.tags.indexOf(tag);
        if (tag_index == -1) return true; this.cur_ewo.tags.splice(tag_index, 1); 
        this.cur_ewo.refresh_lf();
        return true;
    }

    on_tag_cur_ega(tag) {
        if (!this.cur_ega) return false;
        if (this.cur_ega.tags.includes(tag)) return true; // or is it false? not very clear 
        this.cur_ega.tags.push(tag); // we add the tag at the end of the list
        this.refresh_lf();
        return true;
    }

    on_untag_cur_ega(tag) {
        if (!this.cur_ega) return false; const tag_index = this.cur_ega.tags.indexOf(tag);
        if (tag_index == -1) return true; this.cur_ega.tags.splice(tag_index, 1); 
        this.refresh_lf();
        return true;
    }

    on_find(second_word, words) { 
        const cur_ewo = this.cur_ewo; if (cur_ewo == undefined) return true;
        function bid_word_score(bid) {
            const ebu_words = cur_ewo.ebus_by_bid[bid].text.split(' ').filter(s => s.length > 0);
            return words.filter(word => ebu_words.indexOf(word) != -1).length;
        }
        const alphas_by_bid = norm_dict_by_max(filter_dict(arr_func_to_dict(cur_ewo.bids ?? [], bid_word_score), score => score > 0));
        return this.on_alpha_message({ alphas_by_bid });
    }

    on_toggle_grid() { this.is_grid_visible ^= true; return true; }

    on_toggle_clock() { this.show_clock ^= true; return true; }

    on_todo_navigate(direction=-1) {
        const todo_bids = this.get_todo_bids(); // in parent {?} very inefficient
        const next_red_bid = move_in_arr_circular(todo_bids, this.red_bid, direction);
        if (next_red_bid in this.ebus_by_bid) this.make_red_and_move_to_see(this.ebus_by_bid[next_red_bid]);
        return true;
    }





    ///////////////////////////////////////////////////////////////////////////////////////////////
    /// WS SYNC METHODS (? Somehow deprecated as the sync functions in sync.js do a better job) ///
    ///////////////////////////////////////////////////////////////////////////////////////////////

    ewo_upsync(ewo, client, overwrite=false) { client.send_query({ q_type: 'sync-ewo', ewo_dict: ewo.to_dict(true), overwrite }) }
    
    on_upsync_cur_ewo(overwrite, verbose=false) { // {?} inelegant, as it assumes we are in a ega (but how to pick clients otherwise?)
        const ewo = this.cur_ewo; if (ewo == undefined) return true;
        const clients = this.get_cur_sync_clients();
        for (const client of clients) this.ewo_upsync(ewo, client, overwrite);
        if (verbose) this.post_status(`Synced ${ewo.name} to [${clients.map(client => client.address).join(' ')}]`);
        return true;
    }

    ega_upsync(ega, client, overwrite=false) { client.send_query({ q_type: 'sync-ega', ega_dict: ega.to_dict(true, true), overwrite }) }
    
    on_upsync_cur_ega(overwrite, verbose=false) { 
        const ega = this.cur_ega; if (ega == undefined) return true;
        const clients = this.get_cur_sync_clients();
        for (const client of clients) this.ega_upsync(ega, client, overwrite); 
        if (verbose) this.post_status(`Synced ${ega.name} to [${clients.map(client => client.address).join(' ')}]`);
        return true;
    }

    on_local_upsync_overwrite() { 
        this.clu_upsync(this.egas, this.main_client, true, true); 
        setTimeout(() => this.on_worker_at_query('@reload-uni', []), 10); // {?} hacky but allows one to have 
        return true; 
    }

    clu_upsync(clu, client, overwrite=false, verbose=false) { // {?} one problem is the ewos that don't belong to egas
        const clu_dict = { egas: clu.map(ega => ega.to_dict(true, overwrite)) }; // the true is is_deep parameter
        const num_ebus = arr_sum(clu.map(ega => ega.num_ebus));
        client.send_query({ q_type: 'sync-clu', clu_dict, overwrite }); 
        if (verbose) this.post_status(`Synced ${clu_dict.egas.length} egas with ${client.address} with ${num_ebus} ebubles`);
    }

    on_upsync_all(overwrite=false) { this.clu_upsync(this.egas, this.main_client, overwrite=false); return true; }

    // {?} ugly, as it should handle clusters and egaaxies all the same
    async on_file_upsync(overwrite=false) {
        const { canceled, file_paths } = await eapi.request_file_to_open({ dialog_title: `Pick file to send sync` });
        if (canceled || file_paths.length == 0) return true;
        try {
            for (const file_path of file_paths) {
                const data = await eapi.load({ file_path }); // {?} To generalize with a browser-friendly variant
                const ega_dict = JSON.parse(data);
                const { sync_addresses } = ega_dict;
                if (sync_addresses == undefined) { this.post_status(`${file_path} is not a valid sync file: sync_addresses missing`); return true; }
                for (const sync_address of sync_addresses) {
                    const client = this.add_new_sync_client( { address: sync_address, port: 9723} );
                    client.send_query({ q_type: 'sync-ega', ega_dict: ega_dict, overwrite });
                    this.post_status(`Sent sync-ega query to ${sync_address}`);
                }
            }
        }
        catch (err) { this.post_status(`Ega file invalid`); return true; }
    }

    on_toggle_deep_edit() { 
        if (this.is_in_deep_edit) this.finish_deep_edit(this.red_ebu);
        this.is_in_deep_edit ^= true; 
        if (this.is_in_deep_edit) this.start_deep_edit(this.red_ebu);
        return true; 
    }

    on_toggle_edata_edit() { 
        if (this.is_in_edata_edit) this.finish_edata_edit(this.red_ebu);
        this.is_in_edata_edit ^= true; 
        if (this.is_in_edata_edit) { this.start_edata_edit(this.red_ebu); this.cur_ewo.move_to_see_red_ebu(); this.efield_val.focus(); }
        return true;
    }

    on_toggle_baw_edit() { this.is_in_baw_edit ^= true; return true; }

    on_deep_text_area_key_down(event) {
        if (event.key == 'Tab') {
            event.preventDefault();
            const { selectionStart } = this.deep_text_area;
            // We could do some smart things like vscode, but for now, let's just put some spaces
            const text = this.deep_text_area.value;
            if (!(selectionStart >= 0 && selectionStart <= text.length)) return;
            const [textBeforeSelection, textAfterSelection]  = [text.substring(0, selectionStart), text.substring(selectionStart)];
            this.deep_text_area.value = textBeforeSelection + '    ' + textAfterSelection;
            this.deep_text_area.setSelectionRange(selectionStart + 4, selectionStart + 4);
            return true;
        }
        if (event.key == 'Enter' && event.shiftKey) {
            this.on_toggle_deep_edit();
            return true;
        }
    }

    on_deep_text_area_input(event) { // called when the deep text area has changed
        if (this.red_ebu) { this.red_ebu.text = this.deep_text_area.value; this.red_ebu.evo_and_refresh_lf_soon(); }
    }

    on_change_red_ebu(old_red_ebu, new_red_ebu) { 
        if (old_red_ebu == new_red_ebu) return true; // not much to do in this case, and we can assume something happend below
        if (this.is_in_deep_edit) { this.finish_deep_edit(old_red_ebu); if (new_red_ebu != undefined) this.start_deep_edit(new_red_ebu); } 
        if (this.is_in_edata_edit) { this.finish_edata_edit(old_red_ebu); if (new_red_ebu != undefined) this.start_edata_edit(new_red_ebu); }
        return true; 
    }

    on_clear_alpha() { Object.keys(this.alphas_by_bid).forEach(bid => { delete this.alphas_by_bid[bid] }); this.xewo.on_clear_suggest(); return true; }
    add_to_alpha(ebu) { ebu.alpha += 0.2; this.refresh_lf(); return true; } // {?} should be deprecated
    remove_from_alpha(ebu) { ebu.alpha -= 0.2; this.refresh_lf(); return true; } // {?} should be deprecated

    on_alpha_nav(direction, is_global=false, threshold=0.1, n_results=5) {
        let alpha_bids = Object.keys(this.alphas_by_bid).filter(bid => is_global || bid in this.cur_ewo.ebus_by_bid).filter(bid => this.alphas_by_bid[bid] > threshold);
        alpha_bids.sort((left_bid, right_bid) => this.alphas_by_bid[right_bid] - this.alphas_by_bid[left_bid]); // sorted in decreasing order
        const next_red_bid = move_in_arr_circular(alpha_bids, this.red_bid, direction);
        if (next_red_bid == undefined || !(next_red_bid in this.wids_by_bid)) return true;
        this.cur_wid = this.wids_by_bid[next_red_bid];
        this.cur_ewo.red_bid = next_red_bid;
        this.cur_ewo.move_to_see_red_ebu();
        this.refresh_lf();
        return true;        
    }

    make_red_and_move_to_see(ebu) {
        if (this.cur_wid != ebu.wid) { 
            if (!(ebu.wid in this.ewos_by_wid)) return;
            this.cur_wid = ebu.wid;
        }
        this.cur_ewo.red_bid = ebu.bid;
        this.cur_ewo.move_to_see_red_ebu();
    }

    // {?} Doesn't work with overwrite=false
    async on_sync_ega_from_file(overwrite=false) {  
        const dialog_title = `Pick ega file to sync from (overwrite=${overwrite})`;
        const { canceled, file_paths } = await eapi.request_file_to_open({ dialog_title });
        if (canceled || file_paths.length == 0) return true;
        try {
            for (const file_path of file_paths) {
                const data = await eapi.load({ file_path }); // {?} To generalize with a browser-friendly variant
                const ega_dict = JSON.parse(data); this.sync_ega_from_dict(ega_dict, overwrite);
            }
        }
        catch (err) { this.post_status(`Ega loading failed: ${err}`); return true; }
    }

    async on_sync_ewo_from_file(overwrite=false) {
        const dialog_title = `Pick world file to sync from (overwrite=${overwrite})`;
        const { canceled, file_paths } = await eapi.request_file_to_open({ dialog_title });
        if (canceled || file_paths.length == 0) return true;
        try {
            for (const file_path of file_paths) {
                const data = await eapi.load({ file_path }); // {?} To generalize with a browser-friendly variant
                const ewo_dict = JSON.parse(data); 
                sync_ewo_from_dict(this, ewo_dict, overwrite);
            }
        }
        catch (err) { this.post_status(`World loading failed: ${err}`); return true; }
    }

    on_alpha_flow(flow_type) {
        const alpha_ebus = this.cur_ewo_ebus.filter(ebu => ebu.alpha > 0);
        const alpha_bids = alpha_ebus.map(ebu => ebu.bid);
        if (flow_type == 'eli') {
            for (const alpha_ebu of alpha_ebus) {
                const alpha = alpha_ebu.alpha;
                const targetEbus = this.cur_ewo.get_eli_target_ebus(alpha_ebu);
                for (const ebu of targetEbus) {
                    ebu.alpha = alpha;
                }
                alpha_ebu.alpha = 0;
            }
            return;
        }
        if (flow_type == 'next') {
            for (const alpha_ebu of alpha_ebus) {
                const alpha = alpha_ebu.alpha;
                const targetEbus = arr_wrap_if_not_arr(this.cur_ewo.get_next_ebu_wrt_creation_time(alpha_ebu));
                for (const ebu of targetEbus) ebu.alpha = alpha;
                alpha_ebu.alpha = 0;
            }
            return;
        }
        const dirs_by_flow_type = { down: {x: 0, y: 1}, right: {x: 1, y: 0}, left: {x: -1, y: 0}, up: {x: 0, y: -1 } };
        if (dirs_by_flow_type[flow_type]) {
            for (const alpha_ebu of alpha_ebus) {
                const alpha = alpha_ebu.alpha;
                const targetEbus = arr_wrap_if_not_arr(this.cur_ewo.get_ebu_in_dir(alpha_ebu, dirs_by_flow_type[flow_type], alpha_bids));
                for (const ebu of targetEbus) ebu.alpha = alpha;
                alpha_ebu.alpha = 0;
            }
            return;
        }
    }

    on_down_sync_ega(address, ega_name, overwrite=false) {
        let ega_ref = {};
        if (ega_name != undefined) ega_ref = { ega_name };

        const client = this.add_new_sync_client({ address, port: 9723 }); // {?}
        client.send_query({ q_type: 'get-ega', ... ega_ref }, (ega_dict) => this.sync_ega_from_dict(ega_dict, overwrite));
    }

    // Generic At Query
    on_worker_at_query(first_word, tail_words) {
        this.main_client.send_query({ q_type: first_word, prompt_words: tail_words, ... this.query_ref_dict }, (m_dict) => this.on_worker_at_query_response(m_dict));
        return true; 
    }

    on_alpha_find(prompt_words) { 
        this.main_client.send_query({ q_type: 'alpha-find', prompt_words, ... this.query_ref_dict }, (m_dict) => this.on_alpha_find_response(m_dict));
        return true;
    }

    on_alpha_find_response({ r_dict }) { this.on_alpha_message(r_dict) }

    on_worker_at_query_response(m_dict) { 
        const { r_dict } = m_dict;
        if (r_dict) {
            const { status_text, console_text, alphas_by_bid } = r_dict;
            if (status_text) this.post_status(status_text);
            if (console_text ?? status_text) console.log(console_text ?? status_text);
            if (alphas_by_bid) this.on_alpha_message({ alphas_by_bid });
            return true;
        }
        return false;
    }

    on_ask_for_suggestions() { this.xewo.on_ask_for_suggestions() }

    on_ebu_2_vec() {
        const queryRef = { wid: this.cur_wid, red_bid: this.red_bid, green_bid: this.green_bid, blue_bid: this.blue_bid }; // undef will be ignored
        this.main_client.send_query({ q_type: 'ebu2vec', ... queryRef }, (m_dict) => this.on_ebu_2_vec_res(m_dict));
    }

    on_ebu_2_vec_res(m_dict) { 
        const { r_dict, r_text } = m_dict;
        if (r_dict) {
            const { similarity } = r_dict;
            if (similarity) {
                this.post_status(`Ebu2vec cosine similarity: ${similarity}`);
            }
        }
        else if (r_text) {
            this.post_status(`Response: ${r_text}`);
        }
    }

    on_worker_reload() { this.main_client.send_query({ q_type: 'worker-reload' }); }

    on_bloom() { // {?} just for fun for now
        const cur_ewo = this.cur_ewo; if (cur_ewo == undefined) return true;
        let { x: w, y: h } = screen_dims_as_v(); 
        let { x: ox, y: oy } = cur_ewo.screen_to_abs_pos(new V(w * 0.1, h * 0.3)); 
        const bloom_ebus = cur_ewo.ebus.filter(ebu => ebu.is_within_visible_rect);
        bloom_ebus.forEach(ebu => { ebu.soft.x = ox; ebu.soft.y = oy; ebu.soft.w = ebu.w / 4; ebu.soft.h = 16; });
        for (let i = 0; i < 20; i++) setTimeout(() => { cur_ewo.evo_lf(); cur_ewo.refresh_lf(); }, 100 + i * 100);
        return true;
    }
    
    on_edata_edit_event(event, key_event) {
        const ebu = this.red_ebu; if (ebu == undefined) return false;
        const dirs_by_event = { next: +1, prev: -1 };
        if (event in dirs_by_event) { 
            ebu.cur_e_value = this.efield_val.value; 
            ebu.cur_e_field = move_in_arr_circular(ebu.e_fields, ebu.cur_e_field, dirs_by_event[event]);  
            // this.start_edata_edit(ebu);
            this.efield_val.value = ebu.cur_e_value;
            return true; 
        }
        return false;
    }

    start_deep_edit(new_red_ebu) { 
        this.is_in_deep_edit = true;
        if (new_red_ebu == undefined) return; 
        this.deep_text_area.value = new_red_ebu.text; 
        adj_elem(this.deep_text_area, new_red_ebu.font_dict);
        this.cur_ewo.move_to_see_red_ebu(); this.deep_text_area.focus(); 
        this.refresh_lf(); 
    }

    finish_deep_edit(old_red_ebu) { if (old_red_ebu == undefined) return; old_red_ebu.text = this.deep_text_area.value; this.refresh_lf(); }

    start_edata_edit(new_red_ebu) { 
        if (new_red_ebu == undefined) return; 
        if (new_red_ebu.e_fields.indexOf(new_red_ebu.curField) == -1) new_red_ebu.cur_e_field = first(new_red_ebu.e_fields); 
        this.efield_val.value = new_red_ebu.cur_e_value; 
        this.refresh_lf(); 
    }

    finish_edata_edit(old_red_ebu) { 
        if (old_red_ebu == undefined) return; 
        old_red_ebu.cur_e_value = this.efield_val.value.trim(); ; 
        this.refresh_lf(); 
    }

    share_top_alphas_to_xewo(alphas_by_bid) {
        const ranked_alphas = Object.values(alphas_by_bid).sort((x, y) => y - x); // decreasing order
        const max_to_display = 25, minThreshold = 0.01;
        const threshold = Math.max(ranked_alphas[max_to_display] ?? 0, minThreshold);
        const top_bids = Object.keys(alphas_by_bid).filter(bid => alphas_by_bid[bid] >= threshold);
        for (const bid of top_bids) { // {?} we should have a way to access all the ebus, not only in the cur_ewo
            if (bid in this.ebus_by_bid && bid in this.alphas_by_bid) this.xewo.post_alpha_results(this.ebus_by_bid[bid], this.alphas_by_bid[bid]);
        }
    }

    on_show_start() { return this.cur_ewo?.on_show_start() }

    on_show_stop() { return this.cur_ewo?.on_show_stop() }

    on_progress(progress_status, tail_words) {
        const cur_ewo = this.cur_ewo; 
        // {?} hacky... it's for now just to have the right kind of shape of behaviors
        if (cur_ewo == undefined) { this.post_status("Progress can only be activated within an ewo"); return true; }
        if (progress_status == 'off') { cur_ewo.is_in_progress = false; this.post_status("Progress measure off"); return true; }
        if (progress_status == 'on') { cur_ewo.is_in_progress = true; cur_ewo.todo ??= 10; this.post_status("Progress measure on"); this.show_progress = true; return true; }

        if (progress_status == 'hide') { this.show_progress = false; return true; }
        if (progress_status == 'show') { this.show_progress = true; return true; }

        if (progress_status == 'todo') { cur_ewo.is_in_progress = true; cur_ewo.todo = (tail_words[0] - 0) ?? 10; if (!(cur_ewo.todo >= cur_ewo.done)) cur_ewo.done = cur_ewo.todo;} // subtracting 0 is a conversion hack
        if (progress_status == 'done') { cur_ewo.is_in_progress = true; cur_ewo.done = (tail_words[0] - 0) ?? cur_ewo.todo; if (!(cur_ewo.todo >= cur_ewo.done)) cur_ewo.todo = cur_ewo.done; return true; }

        if (cur_ewo.is_in_progress) this.post_status(`Cur ewo completion ${cur_ewo.done}/${cur_ewo.todo}`);

        // {?} add if it is a number, that's how much has been done
        this.evo_and_refresh_lf_soon();
        return true;
    }

    on_view_only() {
        if (!this.cur_ewo) return false; 
        this.cur_ewo.is_view_only = true;
        this.post_status(`Ewo ${this.cur_ewo.name} now in view only mode (enter 'edit' to edit mode again)`);
        return true;
    }

    on_edit_mode() {
        if (!this.cur_ewo) return false;
        this.cur_ewo.is_view_only = false;
        this.post_status(`Ewo ${this.cur_ewo.name} now in edit mode (enter 'view' to go back to view-only mode)`);
        return true;
    }

    on_prepare_copy_move() {
        if (this.cur_ewo == undefined) return false;
        mover.prepare_move(this.cur_ewo, false); // in sync.js
        return true;
    }

    on_prepare_cut_move() {
        if (this.cur_ewo == undefined) return false;
        mover.prepare_move(this.cur_ewo, true); // in sync.js
        return true;
    }
    
    on_execute_prepared_move() {
        if (this.cur_ewo == undefined) return false;
        mover.execute_prepared_move(this.cur_ewo); // // in sync.js
        return true;
    }

    on_execute_alt_move() {
        if (this.cur_ewo == undefined) return false;
        mover.execute_alt_move(this.cur_ewo); // // in sync.js
        return true;
    }

    ///////////////////////////////////
    /// SERIALIZATION EVENT METHODS ///
    ///////////////////////////////////



    //////////////////////////////////
    /// SERVER RESPONSES CALLBACKS ///
    //////////////////////////////////

    on_alpha_message({ alphas_by_bid }) {
        for (const bid in alphas_by_bid) { this.alphas_by_bid[bid] = alphas_by_bid[bid] }
        this.share_top_alphas_to_xewo(alphas_by_bid);
        if (!this.xewo.is_visible) this.xewo.is_visible = true;
        this.refresh_lf();
    }

    on_subgest_message(m_dict) { 
        console.log("Received suggest message");
        const newText = (this.xewo.output.value + m_dict?.r_text ?? '').trim(); this.xewo.output.value = newText; 
    }
}


