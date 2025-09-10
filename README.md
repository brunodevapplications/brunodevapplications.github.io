Horas+ Extra PT 🚀

Aplicação móvel (Android, React Native/Expo) para cálculo de horas extra e subsídio noturno em Portugal, com histórico local e integração de anúncios (AdMob).

📱 Funcionalidades

Cálculo do valor hora base (VH) a partir do salário bruto e horas semanais

Cálculo automático de horas extra:

Dias úteis: 1ª hora +25%, seguintes +37,5%

Descanso/Feriado: +50% por hora

Cálculo do subsídio noturno (+25% VH entre 22h–07h), acumulável com hora extra

Histórico local com AsyncStorage (últimos 50 cálculos)

Consentimento GDPR/UMP integrado (gestão de anúncios personalizados vs não personalizados)

Banner AdMob fixo no rodapé

Interface simples, clara e em português 🇵🇹

🛠️ Tecnologias

React Native

Expo

AsyncStorage
 para histórico local

Google Mobile Ads SDK
 (AdMob)

Safe Area Context
 para suportar notch/gestures

expo-system-ui
 para controlo do tema

🚀 Instalação local

Clonar o repositório:

git clone https://github.com/<teu-username>/horas-extra-pt.git
cd horas-extra-pt


Instalar dependências:

npm install


Executar em modo desenvolvimento:

npx expo start

📦 Build de produção (Android)

Configurar EAS:

npx expo install eas-cli
eas login
eas build:configure


Criar build:

eas build -p android --profile production

📋 App-ads.txt

Para cumprir as políticas da Google e maximizar receita de anúncios, deve ser criado um ficheiro app-ads.txt no domínio associado à aplicação, com o seguinte formato:

google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0


Substituir pub-XXXXXXXXXXXXXXXX pelo teu Publisher ID do AdMob.

🔒 RGPD / GDPR

Consentimento de anúncios gerido via User Messaging Platform (UMP).

O utilizador pode alterar a qualquer momento se deseja anúncios personalizados ou apenas não personalizados.

🧑‍💻 Autor

Bruno Oliveira
GitHub

📜 Licença

Este projeto é disponibilizado sob a licença MIT.
