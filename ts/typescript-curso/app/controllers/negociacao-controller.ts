import { Negociacao } from "../models/negociacao.js";
import { Negociacoes } from "../models/negociacoes.js";
import { NegociacoesView } from "../views/negociacoes-view.js";

export class NegociacaoController {
  private inputData: HTMLInputElement;
  private inputQuantidade: HTMLInputElement;
  private inputValor: HTMLInputElement;
  private negociacoes = new Negociacoes();
  private negociacoesView = new NegociacoesView("#negociacoesView");

  constructor() {
    this.inputData = document.querySelector("#data");
    this.inputQuantidade = document.querySelector("#quantidade");
    this.inputValor = document.querySelector("#valor");
    this.negociacoesView.update(this.negociacoes);
  }

  adiciona(): void {
    const negociacao = this.criaNegociacao();
    this.negociacoes.adicionar(negociacao);
    this.negociacoesView.update(this.negociacoes);
    this.limparFormulario();
  }

  criaNegociacao(): Negociacao {
    const exp = /-/g;
    const negociacao = new Negociacao(
      new Date(this.inputData.value.replace(exp, ",")),
      parseInt(this.inputQuantidade.value),
      parseInt(this.inputValor.value)
    );

    return negociacao;
  }

  limparFormulario(): void {
    this.inputData.value = "";
    this.inputQuantidade.value = "";
    this.inputValor.value = "";

    this.inputData.focus();
  }
}
