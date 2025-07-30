# Vacay em Família

Aplicação móvel colaborativa para relatos de viagem em família. Criada com React Native e Supabase, permite que famílias compartilhem experiências reais de viagem com foco em destinos adaptados para crianças.

---

## Descrição

O **Vacay em Família** é uma aplicação que ajuda famílias a planearem viagens com mais confiança, através de relatos detalhados e organizados por outros utilizadores. A app oferece uma alternativa mais rica e personalizada que redes sociais ou blogs genéricos.

---

## Funcionalidades

- Criação de perfil familiar
- Publicação de relatos de viagem com localização e descrição
- Visualização de relatos de outras famílias
- Filtros por continente, país e cidade
- Interface adaptada para dispositivos móveis (Android e iOS)

---

## Tecnologias Utilizadas

- **React Native** com Expo
- **Supabase** (autenticação + base de dados PostgreSQL)
- **Expo Router** para navegação
- **Expo Go** para testes em iOS
- **Ionicons** para ícones
- **LinearGradient** para efeitos visuais

---

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/vacay-em-familia.git
   cd vacay-em-familia

npm install

npx expo start --tunnel

Estrutura de Pastas:
src/
├── @types/              # Tipos personalizados
├── app/                 # Lógica principal da aplicação
│   ├── auth/            # Autenticação (login e registo)
│   ├── create_relato/   # Criar novo relato
│   ├── edit_relato/     # Editar relato existente
│   ├── profile/         # Perfil do utilizador
│   ├── relato/          # Visualização de relatos
│   ├── relato_guardado/ # Relatos guardados
│   ├── relato_page/     # Página de detalhes do relato
├── components/          # Componentes reutilizáveis
├── context/             # Contextos para gestão de estado