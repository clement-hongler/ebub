//////////////////////////////////////
/// A bel is a background element  ///
//////////////////////////////////////

class Bel {
	constructor(baw, dict) {
		this.baw = baw;
		this.ewo = baw.ewo;
		this.from_dict(dict);
		this.init_div();
	}

	init_div() {
		const { x, y, w, h } = this.soft_rect_dict;
		this.div = new_child_div(this.ewo.div, { x, y, w, h, bg: this.bg, z: this.z });
	}

	destroy() { this.ewo.div.removeChild(this.div) }

	//////////////////////////////////////////////////////////////////
	// {?} What is below is copied from ebus... not good of course ///
	//////////////////////////////////////////////////////////////////

	get is_cur() { return (this.baw.cur_bel == this) && this.ewo.eco.is_in_baw_edit }

	get x() { return this.rect_dict.x } set x(_x) { this.rect_dict.x = _x }
	get y() { return this.rect_dict.y } set y(_y) { this.rect_dict.y = _y }
	get w() { return this.rect_dict.w } set w(_w) { this.rect_dict.w = _w }
	get h() { return this.rect_dict.h } set h(_h) { this.rect_dict.h = _h }
	get z() { return this.is_cur ? 1024 : -512}
	get bg() { return this.is_cur ? (this.is_locked ? '#00000033' : '#00001166') : '#000000'}

	get intersecting_ebus() { return this.ewo.get_intersecting_ebus(this.rect_dict) }

	intersects_ebu(ebu) { return ebu.intersects_abs_rect_dict(this.rect_dict) }

	evo_hf() {
		const { x, y, w, h } = this.rect_dict;
		let { x: sx, y: sy, w: sw, h: sh } = this.soft_rect_dict;
		[sx, sy, sw, sh] = adj_ints([sx, sy, sw, sh], [x, y, w, h]);
		this.soft_rect_dict = { x: sx, y: sy, w: sw, h: sh };
	}
	evo_lf() {}

	refresh_hf() { adj_elem(this.div, this.ewo.abs_to_soft_screen_rect(this.soft_rect_dict)) }
	refresh_lf() { adj_elem(this.div, { z: this.z }); } 

	evo_and_refresh_lf() { this.evo_lf(); this.refresh_lf(); }

	on_event(event, key_event) { 
        const { is_dir_key, key_combination, prev_key_combination } = key_event;
        if (is_dir_key) { if (this.on_dir_key(key_event, true)) return true; } // move_all_intersecting_ebus=true
        if (event == 'toggle_lock') return this.on_toggle_lock();
	}

    on_dir_key(key_event, move_all_intersecting_ebus=true) {
        const { shift_key, alt_key, dir_v } = key_event;
        let multiplier = 16; if (shift_key) multiplier *= 16;
        let [dir_x, dir_y] = [dir_v.x, dir_v.y];
        dir_x *= multiplier; dir_y *= multiplier;
        let { x, y, w, h } = this.rect_dict;
        if (alt_key) { w = clamp(w + dir_x, 32, 4096); h = clamp(h + dir_y, 32, 4096); }
        else { 
        	x += dir_x; y += dir_y; 
        	if (this.is_locked) {
        		let ebus_to_move = this.intersecting_ebus;
        		// we only move the ebus that are not in the selection (to prevent double-move)
        		if (!move_all_intersecting_ebus) ebus_to_move = ebus_to_move.filter(ebu => this.ewo.red_and_selection_bids.indexOf(ebu.bid) == -1); 
        		ebus_to_move.forEach(ebu => { ebu.x += dir_x; ebu.y += dir_y; });
        	}
        }
        this.rect_dict = { x, y, w, h };
        return true;
    }

    on_toggle_lock() { this.is_locked ^= true; this.refresh_lf(); return true; }

    to_dict() { return { eid: this.eid, ... this.rect_dict, type: this.type, attached: this.attached } }

    from_dict(dict) {
    	const { eid, x, y, w, h, type, attached, is_locked } = dict;
    	this.eid = eid ?? `e-${get_unique_id()}`; // {?} legacy
    	this.type = type ?? 'fra_bel';
    	this.rect_dict = { x, y, w, h };
    	this.soft_rect_dict = { ... this.rect_dict };
    	this.attached = attached ?? false;
    	this.is_locked = is_locked ?? true;
    }
}

// A simple frame background element
class FraBel extends Bel {
	constructor(baw, rect_dict) {
		super(baw, rect_dict);
	}

	init_div() {
		super.init_div();
	}

	get frame_color() {
		return this.is_cur ? '#ff000088' : '#ccffff88';
	}

	get border_style() {
		return this.is_locked ? 'solid' : 'dotted';
	}

	refresh_lf() {
		adj_elem(this.div, { border_color: this.frame_color, border_width: 1, border_style: this.border_style, bg: this.bg, z: this.z });
	}
}

// A map-based background element
class MapBel extends Bel {
	constructor(baw, { x, y, w, h }) {

	}
}