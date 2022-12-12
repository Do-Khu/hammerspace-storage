# hammerspace-storage

## Sobre o projeto

Este é um projeto de estudos de desenvolvimento de aplicações com a utilização de microserviços, com o foco do desenvolvimento de uma aplicação para a matéria de programação ECM252 do Instituto Mauá de Tecnologia.

Portanto, o Hammerspace tem como escopo o controle de estoques de cartas de magic de um jogador, bem como seus decks. Como proposta inicial:

- Um jogador pode criar uma conta
- Um jogador pode criar um deck para o formato 'Commander' de MTG
- Um jogador pode pesquisar e adicionar cartas a um deck
- Ao adicionar uma carta que o usuário possui a um deck o sistema deve associar essa carta em estoque ao deck
- O jogador pode adicionar cartas ao estoque sem estarem vinculadas a um deck
- O jogador deve ser capaz de verificar se ele precisa comprar alguma carta para finalizar a montagem de seu deck

Atualmente a aplicação possui 3 microsserviços:

- **[api-gateway](https://github.com/Do-Khu/hammerspace-api)**: a porta de entrada da aplicação, todas as iterações externas devem ser feitas à esse microserviço que irá chamar os demais necessários para realizar os comandos requisitados. Atualmente está realizando o controle de: *Usuários*.
- **[cards](https://github.com/Do-Khu/hammerspace-card)**: Microsserviço de consulta de cartas de magic.
- **[storage](https://github.com/Do-Khu/hammerspace-storage)**: Microsserviço de gerenciamento de decks e cartas que o jogador possui.
