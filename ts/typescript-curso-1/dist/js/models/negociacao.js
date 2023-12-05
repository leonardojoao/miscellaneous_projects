export class Negociacao {
    constructor(_data, quantidade, valor) {
        this._data = _data;
        this._quantidade = quantidade;
        this._valor = valor;
    }
    get data() {
        return this._data;
    }
    get volume() {
        return this._quantidade * this._valor;
    }
}
