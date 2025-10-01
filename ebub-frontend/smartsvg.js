/*
	The place where we draw SVGs
*/

const basic_draw_shift = { x: 256, y: 256 };


// Interactive drawable SVG thing, contained in a div
class SmartSvg { // {?} a better version of the svg class {?} later: should re-implement, without the svg.js foundations
	constructor(parent_div, display_dict) { this.ds_by_d_id = {}; this.init_div(parent_div, display_dict); this.red_d_id = undefined; }

	init_div(parent_div, display_dict) {
		this.div = new_child_div(parent_div, display_dict); 
		this.svg = new Svg({ w: display_dict.w, h: display_dict.h }, this.div);
		this.is_visible = false;
	}

	get w() { return this.svg.w } set w(_w) { this.svg.w = _w; }
	get h() { return this.svg.h } set h(_h) { this.svg.h = _h }

	get ds() { return Object.values(this.ds_by_d_id) }
	get d_ids() { return Object.keys(this.ds_by_d_id) }
	get red_d() { return this.ds_by_d_id[this.red_d_id] } // undefined is an acceptable result

	unshift_pos() { this.ds.forEach(d => d.unshift_pos(basic_draw_shift)); }
	shift_pos() { this.ds.forEach(d => d.shift_pos(basic_draw_shift)); }

	add_d(d) { this.ds_by_d_id[d.d_id] = d; this.red_d_id = d.d_id; return d; }

	add_new_ellipse(dict) { return this.add_d(new DE(this, dict)) }
	add_new_rect(dict) { return this.add_d(new DR(this, dict)) }
	add_new_polyline(dict) { return this.add_d(new DPL(this, dict)) }
	add_new_polygon(dict) { return this.add_d(new DP)}

	make_new_d_from_dict(dict) { this.add_d_from_dict({ d_id: `d-${get_unique_id()}`,... dict }) } 

	add_d_from_dict(dict) { 
		switch (dict?.type) {
			case 'ellipse': return this.add_new_ellipse(dict);
			case 'rect': return this.add_new_rect(dict); 
			case 'polyline': return this.add_new_polyline(dict);
			case 'polygon': return this.add_new_polygon(dict);
			case 'path': return this.add_new_path(dict);
		}
	}

	clear_svg() {  // {?} should only clear if there is something to clear
		const { w, h } = this;
		if (this.svg) { this.div.removeChild(this.svg.svg_node); this.svg = new Svg({ w, h }, this.div); }
		this.ds_by_d_id = {}; 
	}

	/////////////////////////////////
	/// EVO AND REFRESH FUNCTIONS ///
	/////////////////////////////////

	evo_hf() { this.ds.forEach(d => d.evo_hf()); }
	refresh_hf() { this.ds.forEach(d => d.refresh_hf()); }

	///////////////////////////////
	/// SERIALIZATION FUNCTIONS ///
	///////////////////////////////

	to_dict(dict) {
		const [w, h] = [this.w, this.h];
		const ds_by_d_id = {}; this.ds.forEach(d => { ds_by_d_id[d.d_id] = d.to_dict() });
		return { ds_by_d_id };
	}

	from_dict(dict) { 
		this.clear_svg(); 
		const { ds_by_d_id } = dict;
		if (ds_by_d_id) for (const d_id in ds_by_d_id) this.add_d_from_dict(ds_by_d_id[d_id]); 
		this.red_d_id = undefined;
	}
}


// The smart_svg adds interactivity to the in-draw
class DrawBoard extends SmartSvg {
	constructor(eco) { 
		super(eco.div, { z : 2048, w: width(), h: height(), background_color: '#220220ee' }); 
		this.eco = eco;
		this.clear_svg();
	}

	refresh_hf() {
		if (!this.is_visible) return;
		super.refresh_hf();
		const { x, y } = this.cyan_circle_pos;
		[this.cyan_circle.cx, this.cyan_circle.cy] = [x, y];
		const { w, h } = this.eco.screen_soft_size_dict;
		adj_elem(this.div, { w, h });
		this.svg.w = w;
		this.svg.h = h;
	}
	
	get is_visible() { return this._is_visible ?? false }
	set is_visible(_is_visible) { 
		const was_visible = this._is_visible;
		this._is_visible = _is_visible; adj_elem_visibility(this.div, _is_visible); 
		if (!was_visible && _is_visible) this.on_enter_draw_mode(); 
		if (was_visible && !_is_visible) this.on_leave_draw_mode();
	}

	get is_cyan_circle_visible() {
		const red_d = this.red_d;
		if (red_d == undefined) return false;
		if (!(red_d.type == 'polyline' )) return false;
		if (!(red_d.cyan_index >= 0 && red_d.cyan_index < red_d.points.length)) return false;
		return true;
	}

	get cyan_circle_pos() {
		if (!this.is_cyan_circle_visible) return { x: -80, y: -80 }; // {?} hacky way to hide
		const red_d = this.red_d;
		const { x, y } = red_d.soft.points[red_d.cyan_index];
		return { x, y };
	}

	on_event(event, key_event) {
		const { x, y } = basic_draw_shift;
		if (event == 'add_new_ellipse') { this.make_new_d_from_dict({ type: 'ellipse', x, y, w: 64, h: 64 }); return true; }
		if (event == 'add_new_rect') { this.make_new_d_from_dict({ type: 'rect', x, y, w: 64, h: 64 }); return true; }
		if (event == 'add_new_polyline') { this.make_new_d_from_dict({ type: 'polyline', points: [{ x, y }] }); return true; }
		if (event == 'next' || event == 'prev') this.on_switch_red(event == 'next' ? 1 : -1);
		if (event == 'delete') this.on_delete_red_d();
		if (this.red_d?.on_event(event, key_event) ?? false) return true; 
	}

	on_switch_red(dir) { this.red_d_id = move_in_arr_circular(this.d_ids, this.red_d_id, dir); return true; } // in common.js

	on_enter_draw_mode() {
		const red_ebu = eco?.red_ebu; 
		if (red_ebu != undefined && red_ebu.type == 'draw') {
			const svg_dict = red_ebu.svg.to_dict();
			this.from_dict(svg_dict); 
			this.shift_pos();
		}
	}

	on_leave_draw_mode() {
		const cur_ewo = eco?.cur_ewo; if (!cur_ewo) return;
		let red_ebu = eco?.red_ebu; 

		const svg_dict = this.to_dict(); 

		const { x, y, w, h } = comp_smallest_containing_rect(this.ds); // in common.js

		if (red_ebu != undefined && red_ebu.type == 'draw') {
			red_ebu.svg.from_dict(svg_dict);
			red_ebu.w = w;
			red_ebu.h = h;
			red_ebu.evo_lf();
			this.clear_svg();
		}
		else { // we need to create a new ebuble in the cur_ewo
			if (this.ds.length == 0) return; // there is nothing to export
			console.log(cur_ewo.obs_pos);
			red_ebu = cur_ewo.add_new_ebu_from_dict({ metadata: { type: 'draw', pos: { ... cur_ewo.obs_pos }, size: { w, h } } }, true);
			cur_ewo.red_bid = red_ebu.bid;
			red_ebu.svg.from_dict(svg_dict);
			this.clear_svg();
		}
		if (red_ebu) red_ebu.svg.unshift_pos();
	}

	on_delete_red_d() {
		const red_d = this.red_d; if (!red_d) return false;
		red_d.destroy(); 
		delete this.ds_by_d_id[red_d.d_id];
	}

	clear_svg() {  // {?} should only clear if there is something to clear
		super.clear_svg();
		this.cyan_circle = this.svg.add_new_circle(-80, -80, 4, '#00000000', 'cyan'); // {?} hacky
	}

}

// A drawing 'element', 'piece' {?} maybe Vector Element, Veg
class D {
	constructor(smart_svg, dict) {
		this.smart_svg = smart_svg;
		this.from_dict(dict);
		this.init_svg();
	}

	get soft_pos() { return { x: this.soft.x, y: this.soft.y } }
	get soft_size() { return { w: this.soft.w, h: this.soft.h } }

	get is_red() { return this.smart_svg.red_d_id == this.d_id }

	init_svg() {}

	evo_hf() {
		[this.soft.x, this.soft.y] = [adj_int(this.soft.x, this.x), adj_int(this.soft.y, this.y)];
        [this.soft.w, this.soft.h] = [adj_int(this.soft.w, this.w), adj_int(this.soft.h, this.h)];
	}

	refresh_hf() {}

	shift_pos({ x, y }) { this.x += x; this.y += y; }
	unshift_pos({ x, y }) { this.x -= x; this.y -= y; }

	destroy() {} // {?} children should be unified

	// {?} events, maybe to be moved to the interactive side

	on_event(event, key_event) {
		const { is_dir_key, key_combination, prev_key_combination, is_game_dir_key } = key_event;
        if (is_dir_key) { if (this.on_dir_key(key_event)) return true; }
        return false;
	}

	on_dir_key(key_event) {
		const { shiftKey, dir_v, altKey } = key_event;
        let multiplier = 8; if (shiftKey) multiplier *= 8;
        let [dir_x, dir_y] = [dir_v.x, dir_v.y];
        dir_x *= multiplier; dir_y *= multiplier;

        if (altKey) { this.w = clamp(this.w + dir_x, 8, 1024); this.h = clamp(this.h + dir_y, 8, 1024); }
        else { this.x += dir_x; this.y += dir_y; }
        return true;
	}

	from_dict(dict) {
		dict ??= {};
		[this.d_id, this.type] = [dict.d_id, dict.type];
		[this.x, this.y, this.w, this.h] = [dict.x ?? 0, dict.y ?? 0, dict.w ?? 64, dict.h ?? 64];
		this.soft = { x: this.x, y : this.y, w: this.w, h: this.h }; 
	}

	to_dict(dict) { const { d_id, x, y, w, h } = this; return { d_id, x, y, w, h }; }
}


class DE extends D { // ellipse
	constructor(smart_svg, dict) { // the parent calls from_dict and then init_svg
		super(smart_svg, dict); 
	} 

	init_svg() {
		this.ellipse = this.smart_svg.svg.add_new_ellipse(this.soft_cx, this.soft_cy, this.soft_rx, this.soft_ry, 'black', 'white');
	}

	get soft_cx() { return this.soft.x + this.soft_rx }
	get soft_cy() { return this.soft.y + this.soft_ry }
	get soft_rx() { return this.soft.w / 2 }
	get soft_ry() { return this.soft.h / 2 }

	refresh_hf() {  // {?} can adapt with the ux, uy, uw, uh
		const e = this.ellipse; [e.cx, e.cy, e.rx, e.ry] = [this.soft_cx, this.soft_cy, this.soft_rx, this.soft_ry]; 
		e.stroke = this.is_red ? 'red' : 'white'; // {?} for refresh_lf later
	}

	to_dict() { return { ... super.to_dict(), type: 'ellipse' }}

	destroy() { this.smart_svg.svg.rem_elem(this.ellipse); }

}

class DR extends D {
	constructor(smart_svg, dict) { super(smart_svg, dict) } // the parent calls from_dict and then init_svg
	init_svg() {
		this.rect = this.smart_svg.svg.add_new_rect(this.x, this.y, this.w, this.h, 'black', 'white');
	}

	refresh_hf() { // {?} can adapt with the ux, uy, uw, uh
		const r = this.rect; [r.x, r.y, r.w, r.h] = [this.soft.x, this.soft.y, this.soft.w, this.soft.h];
		r.stroke = this.is_red ? 'red' : 'white'; // {?} for refresh_lf later
	}

	to_dict() { return { ... super.to_dict(), type: 'rect' }} // {?} this types there are a bit weird

	destroy() { this.smart_svg.svg.rem_elem(this.rect); }

}


class DPL extends D { // polyline
	constructor(smart_svg, dict) { super(smart_svg, dict); this.cyan_index = 0; } // the parent calls from_dict and then init_svg
	
	get x() { return Math.min(... this.points.map(point => point.x)) ?? 0 }
	set x(_x) { const shift_x = _x - this.x; this.points.forEach(point => point.x += shift_x) }

	get y() { return Math.min(... this.points.map(point => point.y)) ?? 0 }
	set y(_y) { const shift_y = _y - this.y; this.points.forEach(point => point.y += shift_y) }

	get w() { return Math.max(... this.points.map(point => point.x)) - this.x }
	get h() { return Math.max(... this.points.map(point => point.y)) - this.y }

	get point_array() { return this.points.map(point => [point.x, point.y]) }
	get soft_point_array() { return this.soft.points.map(point => [point.x, point.y]) }

	init_svg() {
		this.polyline = this.smart_svg.svg.add_new_polyline(this.point_array, '#00000000', 'white');
		this.polyline.fill = '#00000000';
		this.polyline.stroke = 'white';
	}

	evo_hf() {
		for (let i = 0; i < this.points.length; i++) {
			const [soft_point, point] = [this.soft.points[i], this.points[i]];
			[soft_point.x, soft_point.y] = [adj_int(soft_point.x, point.x), adj_int(soft_point.y, point.y)];
		}
	}

	refresh_hf() {
		const pl = this.polyline;
		pl.points = this.soft_point_array; // {?} need to add a condition for checking if things have changed
		pl.stroke = this.is_red ? 'red' : 'white';
	}

	on_event(event, key_event) {
		if (super.on_event(event, key_event)) return true;
		if (event == 'add_new_point' || event == 'add_new_point_backwards') {
			const insert_index = (event == 'add_new_point') ? this.cyan_index + 1 : this.cyan_index;
			const ref_index = this.cyan_index;
			this.on_add_new_point(insert_index, ref_index, (event == 'add_new_point') ? 1 : -1);
			return true;
		}
		if (event == 'next_cyan' || event == 'prev_cyan') {
			this.on_switch_cyan(event == 'next_cyan' ? 1 : -1)
			return true;
		}
		if (event == 'delete_point' || event == 'delete_point_backwards') {
			return this.on_delete_point((event == 'delete_point') ? 1 : -1);
		}
		if (key_event.is_game_dir_key) {
			return this.on_game_dir_key(key_event);
		}
		return false;
	}

	on_add_new_point(insert_index, ref_index, dir) {
		let { x, y } = this.points[ref_index] ?? { x: 0, y: 0 };
		x += 64 * dir; y += 64 * dir;
		this.points.splice(insert_index, 0, { x, y });
		x += 32; y += 32;
		this.soft.points.splice(insert_index, 0, { x, y });
		this.cyan_index = insert_index;
	}

	on_switch_cyan(dir) { 
		this.cyan_index = move_index_circular(this.cyan_index, dir, this.points.length); 
	}

	on_delete_point(direction) {
		if (this.points.length == 1) return false; // we refuse to work with less than one point
		this.points.splice(this.cyan_index, 1);
		this.soft_points.splice(this.cyan_index, 1)
		if (direction < 0) this.cyan_index--;
		this.cyan_index = Math.max(Math.min(this.cyan_index, this.points.length - 1), 0);
		return true;
	}

	on_game_dir_key(key_event) {
		const { game_dir, shiftKey } = key_event;
		const point = this.points[this.cyan_index]; 
		if (point == undefined) return false;

		let multiplier = 16; if (shiftKey) multiplier *= 8;
        let { x, y } = game_dir;
        x *= multiplier; y *= multiplier;

		point.x += x; point.y += y;
		return true;
	}

	/////////////////////
	/// SERIALIZATION ///
	///////////////////// 

	to_dict() { return { ... super.to_dict(), w: this.w, h: this.h, points: this.points, type: 'polyline' } }

	from_dict(dict) { 
		[this.d_id, this.type] = [dict.d_id, dict.type];
		this.points = JSON.parse(JSON.stringify(dict.points ?? []));
		this.soft = { points: this.points.map(({x, y}) => ({x, y})) };
		this.cyan_index = 0;
	}

	destroy() { this.smart_svg.svg.rem_elem(this.polyline); }

}

class DPG extends D { // {?} not ready, should be merged with DPL
	constructor(smart_svg, dict) { super(smart_svg, dict) } // the parent calls from_dict and then init_svg
	to_dict() { return { ... super.to_dict(), type: 'polygon' } }

}
class DPath extends D { // {?} not ready, should be merged with DPL
	constructor(smart_svg, dict) { super(smart_svg, dict) } // the parent calls from_dict and then init_svg
	to_dict() { return { ... super.to_dict(), type: 'path' } }
}

/*
	{?} Things to add soon:
	-- transfert to DrawingBub
	-- click select

	----

	FIX THE x1, x2 

*/
