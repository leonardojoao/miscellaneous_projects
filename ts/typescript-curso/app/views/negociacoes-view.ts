import { Negociacoes } from "../models/negociacoes.js";

export class NegociacoesView {
  private elemento: HTMLElement;
  constructor(selector: string) {
    this.elemento = document.querySelector(selector);
  }

  template(model: Negociacoes): string {
    return `
      <table class="table table-hover table-bordered">
        <thead>
          <tr>
            <th>Data</th>
            <th>Quantidade</th>
            <th>Valor</th>
          </tr>
        </thead>

        <tbody>
          ${model
            .listar()
            .map((negociacao) => {
              return `
              <tr>
                <td>${new Intl.DateTimeFormat().format(negociacao.data)}</td>
                <td>${negociacao.quantidade}</td>
                <td>${negociacao.valor}</td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>
    `;
  }

  update(model: Negociacoes) {
    this.elemento.innerHTML = this.template(model);
  }
}
