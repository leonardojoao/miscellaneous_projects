export class Negociacao {
  private _data: Date;
  private _quantidade: number;
  private _valor: number;

  constructor(_data: Date, quantidade: number, valor: number) {
    this._data = _data;
    this._quantidade = quantidade;
    this._valor = valor;
  }

  get data(): Date {
    return this._data;
  }

  get volume(): number {
    return this._quantidade * this._valor;
  }
}
