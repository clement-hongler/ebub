///////////////////////////
/// Exchange world      ///
/// to swap data        ///
/// between ebubles and ///
/// an input text area  ///
///////////////////////////

class Xewo extends Ewo {
    // eco is the external cosmos to which the ete belongs
    constructor(xeco) { 
        const wid = `xw-${get_cur_epoch()}`;
        super(xeco, { wid }); // {?} hacky xeco <-> eco
        this.alias_ebus_by_ancestor_bid = {};
        this.xeco = xeco; 
        this.xeco.div.appendChild(this.div); // {?} hacky

        this.init_post_pos = { x: -96, y: -96 };
        this.cur_post_pos = { ... this.init_post_pos };
        this.ebu_vert_space = 8;

        this.all_sorted = true;

        this.is_xewo = true;
        this.input_history = [];
        this.output_history = [];
        this.is_visible = false; 

    }

    // Overrides the parent (called by the parent's constructor)
    init_div() {
        super.init_div();

        [this.input, this.output] = [new_child_elem('textarea', this.div), new_child_elem('textarea', this.div)];
        adj_elems([this.input, this.output], input_padding_dict); // in appearance.js
        hide_elems([this.input, this.output]);        
    }

    //////////////////////
    /// ACCESS METHODS ///
    //////////////////////

    get is_visible() { return this._is_visible ?? false }
    set is_visible(_is_visible) { 
        const wasVisible = this._is_visible; this._is_visible = _is_visible; adj_elem_visibility(this.div, _is_visible); 
        if (!wasVisible && _is_visible) this.on_visible(); 
    }

    get w() { return this.screen_width }
    get h() { return this.screen_height }

    get is_in_input_mode() { return this._is_in_input_mode ?? false }
    set is_in_input_mode(_is_in_input_mode) { 
        this._is_in_input_mode = _is_in_input_mode; if (this.is_in_input_mode) this.input.focus(); else this.input.blur(); 
    }

    get is_in_output_mode() { return this._is_in_output_mode ?? false }
    set is_in_output_mode(_is_in_output_mode) { 
        this._is_in_output_mode = _is_in_output_mode; if (this.is_in_output_mode) this.output.focus(); else this.output.blur();
    }

    ////////////////////
    /// EDIT METHODS ///
    ////////////////////

    add_new_alias_ebu(ebu) { // an alias ebu is just used to display a 'real' ebu in the xewo
        this.evo_and_refresh_lf_soon();
        const ebu_dict = JSON.parse(JSON.stringify(ebu.to_dict())); // cloning 
        const { metadata } = ebu_dict;
        metadata.wid = this.wid; metadata.is_xebu = true;  // {?} should be standarized
        metadata.bid = `xb-a-${get_unique_id()}`; // -a is for alias 
        [metadata.pos.x, metadata.pos.y] = [this.cur_post_pos.x, this.cur_post_pos.y]; 
        this.cur_post_pos.y += metadata.size.h + this.ebu_vert_space; // {?} should also be standardized
        const new_ebu = this.add_new_ebu_from_dict(ebu_dict);
        new_ebu.ancestor_ebu = ebu;
        this.alias_ebus_by_ancestor_bid[ebu.bid] = new_ebu;
        this.is_all_sorted = false; // {?} hacky
        return new_ebu;
    }

    add_new_suggest_ebu(text) {
        this.evo_and_refresh_lf_soon();
        const num_ebus = this.num_ebus;
        const metadata = { pos: { x: 256, y: 256 + num_ebus * 64 }, size: { w: 256, h: 32 }};
        metadata.bid = `xb-s-${get_unique_id()}`;
        const ebu = this.add_new_ebu_from_dict({ metadata, text });
        ebu.soft.x = 0; ebu.soft.y = 0;
        this.is_all_sorted = false; // {?} hacky
        return ebu;
    }

    wrap_input_into_context(input) { return input + "..."; }

    post_alpha_results(ebu, alpha) {
        if (ebu.bid in this.ebus_by_bid) return; 
        const new_ebu = this.add_new_alias_ebu(ebu);
    }

    ///////////////////
    /// EVO METHODS ///
    ///////////////////

    evo_hf(is_deep=true) { super.evo_hf(); } 
    evo_lf(is_deep=true) { super.evo_lf(); this.apply_repulse(); }

    apply_repulse() {
        const y_sorted_ebus = [ ... this.ebus].sort((left_ebu, right_ebu) => left_ebu.y - right_ebu.y);
        this.all_sorted = true;
        for (let i = 0; i + 1 < y_sorted_ebus.length; i++) {
            const [top_ebu, bottom_ebu] = [y_sorted_ebus[i], y_sorted_ebus[i + 1]];
            if (top_ebu.y + top_ebu.h >= bottom_ebu.y) {
                bottom_ebu.y += this.ebu_vert_space; this.all_sorted = false;
            }
        }
        if (!this.is_all_sorted) setTimeout(() => this.apply_repulse(), 1000);
    }

    ///////////////////////
    /// DISPLAY METHODS ///
    ///////////////////////

    // Overrides the parent's method
    refresh_hf(is_deep=true) { if (is_deep) { this.refresh_ebus_hf(); this.refresh_elis_hf(); } }

    // Overrides the parent's method
    refresh_lf(is_deep=true) {
        let { w, h } = this.xeco.screen_size_dict;// window width and height
        [this.iw, this.ih, this.ow, this.oh] = [w - 12, 32, w - 12, 32];
        [this.ix, this.iy, this.ox, this.oy] = [w - this.w, 0, w - this.w, this.ih]; // we put the output below the input
        const vertical_margin = 8;
        const ewo_bg_color = '#000000cc';
        const background_color = '#00004499';

        adj_elem(this.div, { x: 0, y: 0, w: this.w, h: this.h, bg: ewo_bg_color, z: 256 }); 
        adj_elem(this.input, { x: 0, y: 0, w: this.iw, h: this.ih, background_color });
        adj_elem(this.output, { x: 0, y: this.ih + vertical_margin, w: this.ow, h: this.oh, background_color });
        super.refresh_lf();
    }    

    /////////////////////
    /// EVENT METHODS ///
    /////////////////////

    async on_event(event, key_event) { 
        const red_ebu = this.xeco.red_ebu;
        if (event == 'command_entered' && this.is_in_input_mode) return this.on_ask_for_suggestions(); 
        if (event == 'command_entered' && this.is_in_output_mode) return this.on_ship_ebu();
        if (event == 'suggest') return this.on_suggest(`${new Date()}`); 
//        if (event == 'clear_suggest') return this.on_clear_suggest(); 
        return true;
    }

    on_visible() { // called when    we become visible
        this.is_in_input_mode = true;
        const [red_ebu, greenEbu] = [this.xeco.greenEbu, this.xeco.red_ebu];
        if (red_ebu != undefined) {
            const { w, h }= this.xeco.screen_size_dict;
            const margin = 32, fx = margin, fy = margin, fw = (w - this.w) - 2 * margin, fh = h - 2 * margin;
            if (fw >= 128 && fh >= 32) this.xeco.cur_ewo.move_to_see_red_ebu({ fx, fy, fw, fh }); 
        }
        return true;
    }

    on_load_ebu(ebu) { if (ebu == undefined) return false; this.is_visible = true; }

    on_ship_ebu() {
        let text = this.output.value.trim(); 
        if (text.length > 0) { this.xeco.cur_ewo?.onNewEbu(text); this.output.value = ''; } // {?} IMPROVE WHERE THE BUB LANDS
        this.is_visible = false; return true;
    }

    on_make_input(red_ebu, greenEbu) { 
        this.is_visible = true;
        let text = "";
        if (greenEbu != undefined && greenEbu != red_ebu) text += greenEbu.text + '\n'; 
        if (red_ebu != undefined) text += red_ebu.text + '\n';
        text = text.trim(); 
        this.input.value = text;
    }

    on_ask_for_suggestions() { 
        this.output.value = ''; 
        const context = this.wrap_input_into_context(this.input.value); 
        const q_id = `q-${get_unique_id()}`;
        this.xeco.main_client.send_query({ q_type: 'ask-suggest', q_id, context }, (m_dict) => this.xeco.on_suggestMessage(m_dict)); 
        [this.is_in_input_mode, this.is_in_output_mode] = [false, true]; 
        return true; 
    }

    on_suggest(text) { const ebu = this.add_new_suggest_ebu(text); this.red_bid = ebu.bid; } // {?} this is just for testing purposes

    on_clear_suggest() { 
        if (this.bids.length == 0) { this.is_visible = false; return; } // {?} hacky but reflects the fact that a second clear is a hide
        this.bids.forEach(bid => this.remove_ebu_by_bid(bid)); 
        this.alias_ebus_by_ancestor_bid = {};
        [this.cur_post_pos.x, this.cur_post_pos.y] = [this.init_post_pos.x, this.init_post_pos.y];
    }

    onClear() { }
}



// {?} Maybe the xewo needs its own websocket connection
