/////////////////////////////////
/// WS QUERY CLIENT INTERFACE ///
/////////////////////////////////


// {?} Change the name
class Client {
    constructor({ address, port, reply_handlers_by_q_type }) {
        [this.address, this.port] = [address, port];
        this.m_type = 'client-query';  // the message type associated with the queries
        this.protocol = 'ws'; // {?} Later add support for wss
        this.mesque = []; // message queue
        this.reconnectTime = 1000; // the time after which we will attempt to reconnect in case of failed connection
        this.worker_reply_handlers_by_q_type = {}; // handles the query replies from the workers
        this.reply_handlers_by_q_type = reply_handlers_by_q_type ?? {};
        this.reply_handlers_by_q_id = {}; // useful 
        [this.min_reconnect_time, this.max_reconnect_time] = [250, 5 * 60 * 1000]; // we will increase reconnectTime in that interval
        const self = this; async function connect() { await self.connect() }
        setTimeout(connect, 0);
    }

    get ws_full_address() { return `${this.protocol}://${this.address}:${this.port}` }

    increase_reconnect_time() { this.reconnectTime = Math.round(Math.min(this.reconnectTime * Math.sqrt(2), this.max_reconnect_time)); }

    async connect() {
        if (this.is_connected) return;
        // {?} Check whether this doesn't cause problems if we e.g. close the laptop lid
        if (is_running_electron) { if (!await eapi.is_ws_available({ host: this.address, port: this.port })) return; }
        try {
            this.ws = new WebSocket(this.ws_full_address);
            add_events(this.ws, { open: (e => this.on_open(e)), message: (e => this.on_message(e)) });
            add_events(this.ws, { close: (e => this.on_close(e)), error: (e => this.on_error(e)) });
        }
        catch (e) { console.log(`Error in building a Client`, e) }
    }

    send_ready_message() { return this.send({ m_type: this.m_type })}
    send_query(m_dict, handler) { // handler is a callback function eating an m_dict to be called when we get the message
        const q_id = `q-${get_unique_id()}`; 
        if (handler != undefined) this.reply_handlers_by_q_id[q_id] = handler;
        return this.send({ ... m_dict, q_id, m_type: this.m_type });
    }
    
    send(m_dict) {
        try { const message = JSON.stringify(m_dict); this.mesque.push(message); return this.send_all(); }
        catch (e) { console.log(`Error while trying to send message: ${e}`); return false; }
    }

    send_all() {
        if (!this.is_connected) return false;
        try { while (this.mesque.length > 0) this.ws.send(this.mesque.shift(0)); return true; }
        catch (e) { return false; }
    }

    on_open(e) { this.is_connected = true; this.reconnectTime = this.min_reconnect_time; this.send_ready_message(); }
    on_close(e) { this.is_connected = false; }
    on_message(e) {
        const m_dict = JSON.parse(e.data);
        const { m_type } = m_dict;
        if (m_type == 'worker-reply' || m_type == 'server-reply') { return this.on_reply(m_dict); }
        return false;
    }

    on_reply(m_dict) { 
        const { q_type, q_id } = m_dict;
        let handler = this.reply_handlers_by_q_type[q_type];
        if (handler != undefined) handler(m_dict);
        handler = this.reply_handlers_by_q_id[q_id];
        if (handler != undefined) handler(m_dict);
        return true;
    }

    on_error(e) { }

    evo_lf() { 
        const self = this; async function attempt_reconnect() { await self.connect(); self.increase_reconnect_time(); }
        if (!this.is_connected) setTimeout(attempt_reconnect, this.reconnectTime); 
        this.send_all(); 
    }
}