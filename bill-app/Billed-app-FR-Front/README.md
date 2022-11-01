# Billapp frontend

## L'architecture du projet":"

Ce projet, dit frontend, est connecté à un service API backend que vous devez aussi lancer en local.

Le projet backend se trouve ici: `https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-back`

## Organiser son espace de travail":"

Pour une bonne organization, vous pouvez créer un dossier bill-app dans lequel vous allez cloner le projet backend et par la suite, le projet frontend:

Clonez le projet backend dans le dossier bill-app :

```text
git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Back.git
```

```text
bill-app/
   - Billed-app-FR-Back
```

Clonez le projet frontend dans le dossier bill-app :

```text
git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front.git
```

```text
bill-app/
   - Billed-app-FR-Back
   - Billed-app-FR-Front
```

## Comment lancer l'application en local ?

### étape 1 - Lancer le backend":"

Suivez les indications dans le README du projet backend.

### étape 2 - Lancer le frontend":"

Allez au repo cloné :

```text
cd Billed-app-FR-Front
```

Installez les packages npm (décrits dans `package.json`) :

```text
npm install
```

Installez live-server pour lancer un serveur local :

```text
npm install -g live-server
```

Lancez l'application :

```text
live-server
```

Puis allez à l'adresse : `http://127.0.0.1:8080/`

## Comment lancer tous les tests en local avec Jest ?

```text
npm run test
```

## Comment lancer un seul test ?

Installez jest-cli :

```text
$npm i -g jest-cli
$jest src/__tests__/your_test_file.js
```

## Comment voir la couverture de test ?

`http://127.0.0.1:8080/coverage/lcov-report/`

## Comptes et utilisateurs":"

Vous pouvez vous connecter en utilisant les comptes:

### administrateur":"

```text
utilisateur : admin@test.tld 
mot de passe : admin
```

### employé":"

```text
utilisateur : employee@test.tld
mot de passe : employee
```
