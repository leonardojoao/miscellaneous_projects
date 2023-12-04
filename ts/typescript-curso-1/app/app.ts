import { Negociacao } from "./models/negociacao.js";

const negociacao = new Negociacao(new Date(), 20, 10);

console.log(negociacao.volume);
