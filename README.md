# Nathan's Boat Trips

Agora faça um aplicativo de reserva de passeios de barco, com o nome Nathan Passeios e Turismo, onde contará com o menu inicial com as opções:



1 - Passeio de Escuna



2 - Passeio em Arraial do Cabo



3 - Outros passeios



Ao selecionar a opção 1 o app direcionará para a página de preenchimento dos dados do cliente para a reserva com os seguintes campos:



Nome completo de um responsável:



Número de telefone:



Quantidade de passageiros:

Abaixo coloque uma caixa de multipla escolha com a opção:

Tem passageiros criança?

Sim - Não.

Se o cliente selecionar "não", acontece nada, segue.

Se o cliente selecionar "sim" aí abre uma caixa abaixo pedindo que ele coloque a quantidade de crianças. Baseado no número de crianças até 8 no máximo, crie a mesma quantidade de caixas pedindo a idade dessas crianças. Caso a idade seja menor que 5 anos de idade, aparece uma mensagem "passageiro free!", caso seja de 6 a 10 anos aparece "passageiro pagando meia!!" e acima de 10 anos não aparece nada.



Passageiros free:



Forma de pagamento: (aqui ao invés de preencher o cliente selecionará entre as opções: dinheiro, cartão de débito, cartão de crédito e Pix)



Observação: Caso o cliente selecione na forma de pagamento o " cartão de crédito" aparecer uma mensagem abaixo destacando que haverá um acréscimo de 5% do valor referente a taxa da maquininha.



No fim, com todos os dados preenchidos, o app produzirá um texto copiavel com todos os dados que o cliente preencheu e também permitirá exportar esse texto para outros apps via compartilhamento.



Na opção 2 a lógica é basicamente a mesma com apenas uma diferença nos campos de preenchimento:



🇧🇷 Para fazer sua reserva para o passeio preciso que você me mande os seguintes dados:



Um nome completo de um responsável: ✍️



Nome da pousada: 🛌



Número do quarto: 🔢



Endereço da Pousada: 📍





Forma de pagamento: (aqui ao invés de preencher o cliente selecionará entre as opções: dinheiro, cartão de débito, cartão de crédito e Pix).



O app será simples somente para preencher dados mais prático possível, suas cores serão turquesa, azul escuro e preto e o texto será branco. Na página inicial, permita uma opção onde posso alterar o idioma do app entre Português, Espanhol, Inglês, Francês e Italiano.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nathan-passeios-turismo.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e52cb92f-bc76-4ce1-935e-5b4a0c257527).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
