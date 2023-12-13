import { Negociacoes } from "../models/negociacoes.js";
import { View } from "./view.js";

export class NegociacoesView extends View {
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
    this.element.innerHTML = this.template(model);
  }
}
