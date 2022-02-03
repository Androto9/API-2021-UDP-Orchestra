# Teaching-HEIGVD-RES-2020-Labo-Orchestra

## Admin

* **You can work in groups of 2 students**.
* It is up to you if you want to fork this repo, or if you prefer to work in a private repo. However, you have to **use exactly the same directory structure for the validation procedure to work**. 
* We expect that you will have more issues and questions than with other labs (because we have a left some questions open on purpose). Please ask your questions on Teams, so that everyone in the class can benefit from the discussion.
* ⚠️ You will have to send your GitHub URL, answer the questions and send the output log of the `validate.sh` script, which prove that your project is working [in this Google Form](https://forms.gle/6SM7cu4cYhNsRvqX8).

## Objectives

This lab has 4 objectives:

* The first objective is to **design and implement a simple application protocol on top of UDP**. It will be very similar to the protocol presented during the lecture (where thermometers were publishing temperature events in a multicast group and where a station was listening for these events).

* The second objective is to get familiar with several tools from **the JavaScript ecosystem**. You will implement two simple **Node.js** applications. You will also have to search for and use a couple of **npm modules** (i.e. third-party libraries).

* The third objective is to continue practicing with **Docker**. You will have to create 2 Docker images (they will be very similar to the images presented in class). You will then have to run multiple containers based on these images.

* Last but not least, the fourth objective is to **work with a bit less upfront guidance**, as compared with previous labs. This time, we do not provide a complete webcast to get you started, because we want you to search for information (this is a very important skill that we will increasingly train). Don't worry, we have prepared a fairly detailed list of tasks that will put you on the right track. If you feel a bit overwhelmed at the beginning, make sure to read this document carefully and to find answers to the questions asked in the tables. You will see that the whole thing will become more and more approachable.


## Requirements

In this lab, you will **write 2 small NodeJS applications** and **package them in Docker images**:

* the first app, **Musician**, simulates someone who plays an instrument in an orchestra. When the app is started, it is assigned an instrument (piano, flute, etc.). As long as it is running, every second it will emit a sound (well... simulate the emission of a sound: we are talking about a communication protocol). Of course, the sound depends on the instrument.

* the second app, **Auditor**, simulates someone who listens to the orchestra. This application has two responsibilities. Firstly, it must listen to Musicians and keep track of **active** musicians. A musician is active if it has played a sound during the last 5 seconds. Secondly, it must make this information available to you. Concretely, this means that it should implement a very simple TCP-based protocol.

![image](images/joke.jpg)


### Instruments and sounds

The following table gives you the mapping between instruments and sounds. Please **use exactly the same string values** in your code, so that validation procedures can work.

| Instrument | Sound         |
|------------|---------------|
| `piano`    | `ti-ta-ti`    |
| `trumpet`  | `pouet`       |
| `flute`    | `trulu`       |
| `violin`   | `gzi-gzi`     |
| `drum`     | `boum-boum`   |

### TCP-based protocol to be implemented by the Auditor application

* The auditor should include a TCP server and accept connection requests on port 2205.
* After accepting a connection request, the auditor must send a JSON payload containing the list of <u>active</u> musicians, with the following format (it can be a single line, without indentation):

```
[
  {
  	"uuid" : "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60",
  	"instrument" : "piano",
  	"activeSince" : "2016-04-27T05:20:50.731Z"
  },
  {
  	"uuid" : "06dbcbeb-c4c8-49ed-ac2a-cd8716cbf2d3",
  	"instrument" : "flute",
  	"activeSince" : "2016-04-27T05:39:03.211Z"
  }
]
```

### What you should be able to do at the end of the lab


You should be able to start an **Auditor** container with the following command:

```
$ docker run -d -p 2205:2205 res/auditor
```

You should be able to connect to your **Auditor** container over TCP and see that there is no active musician.

```
$ telnet IP_ADDRESS_THAT_DEPENDS_ON_YOUR_SETUP 2205
[]
```

You should then be able to start a first **Musician** container with the following command:

```
$ docker run -d res/musician piano
```

After this, you should be able to verify two points. Firstly, if you connect to the TCP interface of your **Auditor** container, you should see that there is now one active musician (you should receive a JSON array with a single element). Secondly, you should be able to use `tcpdump` to monitor the UDP datagrams generated by the **Musician** container.

You should then be able to kill the **Musician** container, wait 5 seconds and connect to the TCP interface of the **Auditor** container. You should see that there is now no active musician (empty array).

You should then be able to start several **Musician** containers with the following commands:

```
$ docker run -d res/musician piano
$ docker run -d res/musician flute
$ docker run -d res/musician flute
$ docker run -d res/musician drum
```
When you connect to the TCP interface of the **Auditor**, you should receive an array of musicians that corresponds to your commands. You should also use `tcpdump` to monitor the UDP trafic in your system.

# Tasks and questions

Reminder: answer the following questions [here](https://forms.gle/6SM7cu4cYhNsRvqX8).

## Task 1: design the application architecture and protocols

| #  | Topic |
| --- | --- |
|Question | How can we represent the system in an **architecture diagram**, which gives information both about the Docker containers, the communication protocols and the commands? |
| | *Insert your diagram here...* |
|Question | Who is going to **send UDP datagrams** and **when**? |
| | Les musiciens envoient leur uuid ainsi que le son lié à leur instrument chaque seconde. |
|Question | Who is going to **listen for UDP datagrams** and what should happen when a datagram is received? |
| | Les auditeurs vont écouter les UDP datagrams entrant dans l'adresse multicast 239.255.22.5 envoyés par les musiciens. |
|Question | What **payload** should we put in the UDP datagrams? |
| | Ce qui doit être mis dans le payload des UDP datagrams sont l'uuid du musicien et le son produit par son instrument. |
|Question | What **data structures** do we need in the UDP sender and receiver? When will we update these data structures? When will we query these data structures? |
| | Les musiciens doivent envoyer des datas au format JSON qui seront ensuite parsées par les auditeurs. Ces derniers vont ensuite update les datas structures lorsqu'un uuid déjà existant est reçu à nouveau.|


## Task 2: implement a "musician" Node.js application

| #  | Topic |
| ---  | --- |
|Question | In a JavaScript program, if we have an object, how can we **serialize it in JSON**? |
| | À l'aide de la fonction stringify() de JSON, on transforme un objet javascript en string pour pouvoir l'envoyer. Ensuite avec la fonction parse() de JSON, on effectue l'inverse (transformation d'un string en objet javascript). |
|Question | What is **npm**?  |
| | Node Package Manager, permet de gérer les dépendances et d'installer les packages de NodeJS. |
|Question | What is the `npm install` command and what is the purpose of the `--save` flag?  |
| | La commande `npm install` permet d'installer un package désiré de NodeJS et ses dépendances dans un dossier appelé `node-modules`. On utilise le flag `--save` pour sauvegarder les dépendences installées dans le fichier package.json lorsqu'un package est spécifié (`npm install <nomdupackage> --save`). |
|Question | How can we use the `https://www.npmjs.com/` web site? |
| | Le site est une bibliothèque contenant tous les packages pouvant être installés dans un projet NodeJS. Il suffit de rechercher le package désiré et d'utiliser la commande `npm install <nomdupackage> --save` afin de l'installer. |
|Question | In JavaScript, how can we **generate a UUID** compliant with RFC4122? |
| | Tout d'abord il faut installer le package uuid avec `npm install uuid --save`, ensuite dans le script javascript écrire la ligne suivante `var { v4: uuidv4 } = require('uuid');` et pour finir avec la fonction `uuidv4()` on génère un uuid aléatoire. |
|Question | In Node.js, how can we execute a function on a **periodic** basis? |
| | Grâce à la fonction setInterval(function, time), à noter que `time` est en milliseconde donc pour exécuter la fonction chaque seconde il faut mettre `1000`.  |
|Question | In Node.js, how can we **emit UDP datagrams**? |
| | À l'aide du module de NodeJS `dgram`. Il faut écrire les lignes suivantes dans le script `var dgram = require('dgram');`, ensuite `var s = dgram.createSocket('udp4');` qui va créer le socket et pour finir grâce à la fonction `send(message, offset, length, port, address, function)`, on peut envoyer nos UDP datagrams. |
|Question | In Node.js, how can we **access the command line arguments**? |
| | Grâce à l'objet `process`, il est possible de récupérer les arguments avec `process.argv[n]` (n étant l'index de l'argument voulu). |


## Task 3: package the "musician" app in a Docker image

| #  | Topic |
| ---  | --- |
|Question | How do we **define and build our own Docker image**?|
| | En premier il faut créer un dockerfile dans le dossier où l'on désire créer une image. Ensuite, il faut utiliser la commande `docker build -t [tag/nom de l'image] .` dans le dossier où se trouve notre dockerfile. |
|Question | How can we use the `ENTRYPOINT` statement in our Dockerfile?  |
| | La commande `ENTRYPOINT ["node", "/opt/app/musician.js"]` permet d'exécuter la commande `node /opt/app/musician.js` dans un container à sa création et va lancer le fichier js correspondant (musician.js dans ce cas). |
|Question | After building our Docker image, how do we use it to **run containers**?  |
| | Il faut utiliser la commande `docker run -d --name pianist res/musician piano`. Ici piano est l'argument qu'on passe à notre fichier js. |
|Question | How do we get the list of all **running containers**?  |
| | Avec la commande `docker ps`. |
|Question | How do we **stop/kill** one running container?  |
| | En premier, il faut soit le nom du container soit l'id. Ensuite, il suffit d'utiliser la commande `docker kill [nom du container ou id]`  |
|Question | How can we check that our running containers are effectively sending UDP datagrams?  |
| | Il faut run un container de `res/musician` sans l'option `-d` (qui effectue les tâches en background) afin d'obtenir les sorties sur la console. Ensuite, utiliser la commande `docker logs` pour voir les datagrammes envoyés. Pour vérifier qu'on envoie correctement, on peut aussi run un container de `res/auditor` pour vérifier que celui-ci reçoit bien les données. |


## Task 4: implement an "auditor" Node.js application

| #  | Topic |
| ---  | ---  |
|Question | With Node.js, how can we listen for UDP datagrams in a multicast group? |
| | Il faut utiliser `dgram` en écrivant dans le script js les lignes suivantes `const dgram = require('dgram');` puis `const s = dgram.createSocket('udp4');`, cette dernière va créer le socket pour la connexion **UDP**. Ensuite, il faut faire un `bind(port, function)` et dans ce bind il faut utiliser la fonction `addMembership(multicast address)`. |
|Question | How can we use the `Map` built-in object introduced in ECMAScript 6 to implement a **dictionary**?  |
| | `Map` permet d'associer les sons à leurs instruments et vice-versa. Il faut écrire la ligne suivante sur le script js `const myMap = new Map()` et pour y ajouter des éléments il faut faire `myMap.set('piano', 'ti-ta-ti')`. |
|Question | How can we use the `Moment.js` npm module to help us with **date manipulations** and formatting?  |
| | Tout d'abord, installer le module avec la commande `npm install moment --save`, ensuite dans le script écrire `const moment = require('moment')` et pour finir faire `moment.format();` pour générer la date par défaut. Plusieurs formats sont fournis par le module, pour en savoir plus il suffit de consulter la documentation de moment.js. Nous n'avons pas utilisé **moment** dans notre code mais **date**. |
|Question | When and how do we **get rid of inactive players**?  |
| | On supprime un musicien quand ce dernier n'a pas envoyé de son depuis plus de 5 secondes. Dans notre script js, nous avons une fonction qui incrémente le temps chaque seconde. Ensuite dans la fonction `s.on()`, on ajoute un musicien s'il n'existait pas déjà par contre s'il est déjà dans la liste on réinisialise son temps à 0. Pour finir, on a une fonction qui supprime les musiciens qui n'ont pas envoyé de son depuis plus de 5 secondes. |
|Question | How do I implement a **simple TCP server** in Node.js?  |
| | Il y a 3 étapes à l'implémentation, premièrement on ajoute au script la ligne `const net = require('net');`, ensuite on doit créer le serveur avec `var tcpServer = net.createServer(function(socket))` qui sera appelé à chaque fois qu'un client se connecte. Pour finir, on utilise la fonction `listen(tcp_port)` avec le port pour la connection **TCP**. |


## Task 5: package the "auditor" app in a Docker image

| #  | Topic |
| ---  | --- |
|Question | How do we validate that the whole system works, once we have built our Docker image? |
| | Il y a 2 façons de valider le bon fonctionnement de notre système. La première est de run un container **auditor** et plusieurs **musician**, ensuite de faire un `telnet localhost 2205` sur la console et là on devrait obtenir une liste avec nos musiciens. Il faut refaire cette dernière étape mais cette fois en supprimant un container **musician** et refaire un **telnet** 6 secondes après la suppression et vérifier qu'on a bien un musicien en moins dans la liste. La deuxième façon est de lancer le script de validation fourni dans le repo et passer chaques tests de celui-ci. |


## Constraints

Please be careful to adhere to the specifications in this document, and in particular

* the Docker image names
* the names of instruments and their sounds
* the TCP PORT number

Also, we have prepared two directories, where you should place your two `Dockerfile` with their dependent files.

### Validation
Have a look at the `validate.sh` script located in the top-level directory. This script automates part of the validation process for your implementation (it will gradually be expanded with additional operations and assertions). As soon as you start creating your Docker images (i.e. creating your Dockerfiles), you should **try to run it** to see if your implementation is correct. When you submit your project in the [Google Form](https://forms.gle/6SM7cu4cYhNsRvqX8), the script will be used for grading, together with other criteria.
