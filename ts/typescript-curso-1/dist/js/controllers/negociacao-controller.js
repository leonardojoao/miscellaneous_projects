import { Negociacao } from "../models/negociacao.js";
import { Negociacoes } from "../models/negociacoes.js";
export class NegociacaoController {
    constructor() {
        this.negociacoes = new Negociacoes();
        this.inputData = document.querySelector("#data");
        this.inputQuantidade = document.querySelector("#quantidade");
        this.inputValor = document.querySelector("#valor");
    }
    adiciona() {
        const negociacao = this.criaNegociacao();
        this.negociacoes.adicionar(negociacao);
        console.log(this.negociacoes.listar());
        this.limparFormulario();
    }
    criaNegociacao() {
        const exp = /-/g;
        const negociacao = new Negociacao(new Date(this.inputData.value.replace(exp, ",")), parseInt(this.inputQuantidade.value), parseInt(this.inputValor.value));
        return negociacao;
    }
    limparFormulario() {
        this.inputData.value = "";
        this.inputQuantidade.value = "";
        this.inputValor.value = "";
        this.inputData.focus();
    }
}
