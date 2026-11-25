// Christmas 2026 content. Dates use the shared Mexico City calendar.
window.MayAdventContent = {
    year: 2026,
    correctTree: 15,
    // Positions refer to the illustrated field. Similar trees deliberately
    // differ in foliage, decorations, or the color of their top star.
    trees: [
        [13.6,17.4,"Abeto verde con perlas y estrella crema"],
        [28.9,17.3,"Abeto ancho verde con cintas rojas y estrella dorada"],
        [46.6,18.0,"Pino azul hielo nevado con estrella blanca"],
        [60.8,20.1,"Abeto natural con bayas, lazo rojo y estrella roja"],
        [75.0,20.0,"Pino verde con espumillón crema y estrella dorada"],
        [86.4,21.0,"Abeto azul marino con copos y estrella plateada"],
        [7.4,31.5,"Árbol rosa con dulces y estrella crema"],
        [22.1,32.0,"Abeto verde con piñas y estrella dorada"],
        [38.5,31.0,"Abeto azul verdoso con estrellas y estrella roja"],
        [54.0,32.0,"Abeto verde con velas, lazo rojo y estrella dorada"],
        [69.0,32.2,"Abeto lavanda con lazos y estrella rosa"],
        [93.0,32.5,"Abeto verde con piñas, lazos crema y estrella azul"],
        [14.0,45.6,"Abeto verde con bayas y lazo crema"],
        [29.4,45.6,"Abeto azul oscuro con luna y estrella doradas"],
        [45.3,45.8,"Abeto verde con galletas y gran lazo rojo"],
        [61.2,46.5,"Abeto azul con esferas crema y estrella azul"],
        [77.5,45.5,"Pino delgado verde con perlas y estrella crema"],
        [90.9,46.0,"Abeto verde con gran lazo de cuadros"],
        [7.2,58.2,"Abeto verde nevado con copos crema"],
        [22.7,58.0,"Abeto verde con collares de perlas y lazos azules"],
        [37.5,58.0,"Abeto verde con bayas, nieve y estrella dorada"],
        [53.1,57.8,"Pino natural de ramas largas con lazo azul"],
        [70.9,58.0,"Abeto verde con naranjas y canela"],
        [84.0,59.1,"Abeto azul claro nevado con estrella crema"],
        [13.6,72.1,"Abeto verde con farolitos"],
        [29.4,73.0,"Abeto bajo cubierto de nieve y bayas"],
        [45.3,73.2,"Abeto verde con estrellas doradas y lazos rojos"],
        [61.0,72.0,"Abeto rosa con galletas de corazón"],
        [76.6,72.1,"Abeto verde con flores crema y bayas"],
        [92.2,72.3,"Pino esbelto verde con cuentas y estrellas"],
        [6.6,87.0,"Abeto nevado con copos y guirnaldas blancas"],
        [21.6,87.0,"Abeto natural con bellotas y piñas"],
        [37.0,87.5,"Abeto nevado con lazos azules y estrella crema"],
        [53.0,87.0,"Abeto verde con grandes lazos y bayas rojas"],
        [68.6,86.4,"Pino esbelto verde con estrellas doradas"],
        [85.2,86.0,"Abeto verde con lazos crema y adornos alargados"]
    ],
    // The final letter will be supplied by Miguel; do not invent its contents.
    finalLetter: null,
    // The first clue is available now; each next clue starts on the previous gift's date.
    chapters: [
        { id: "rooftop", name: "Las azoteas", day: 1, clueDay: null, description: "Una ciudad llena de pequeños secretos.", gift: "Gomitas de chile", scene: [0, 0] },
        { id: "window", name: "La ventana", day: 8, clueDay: 1, description: "Hay algo en esa ventana que me resulta familiar…", gift: "Pijama de Comegalletas", scene: [100, 0] },
        { id: "forest", name: "El campo de árboles", day: 15, clueDay: 8, description: "Entre tantos árboles, uno está esperando que lo encuentres.", gift: "LEGO · Ramo de Flores Fantasía en Rosa", scene: [0, 100] },
        { id: "apartment", name: "Nuestra Navidad", day: 25, clueDay: 15, description: "Después de tanto camino, llegamos a casa.", gift: "Birkenstock Boston azules", scene: [100, 100] }
    ],
    conversations: {
        rooftop: [
            ["wink", "Vaya, vaya… Ya me habías visto antes, ¿verdad? Y sabes que lo traigo."],
            ["thinking", "Regresar en tus palabras deberás, porque tu lengua lo necesitará. Algo que te gusta y que jamás puede faltar…"],
            ["excited", "Con este primer regalo empieza tu Navidad. ♡"]
        ],
        window: [
            ["hello", "Esto también te gusta mucho, ¿verdad? Como el anterior regalo…"],
            ["wink", "Pero te cuento que el siguiente ya no lo adivinarás, porque cuando todos duermen, este está."],
            ["thinking", "Con los ojos cerrados no es muy fácil poder mirar. Una vez que lo veas, recuerda su color, porque así vendrá esta Navidad."],
            ["tender", "Te manda un mensaje tu rati: te ama mucho y muy hardy, y espera que te esté gustando. ♡"]
        ],
        forest: [
            ["excited", "¡Ya casi es Navidad, ya casi, casi! Y el árbol me tendré que llevar."],
            ["thinking", "Me tendrás que ayudar y escoger el que más represente esta Navidad."],
            ["wink", "Una elección al día, cutie. Mira con calma… Recuerda lo que descubriste en la ventana y fíjate también en lo que llevan arriba."]
        ],
        forestClue: [
            ["excited", "¡Este es! Este árbol sí viene con nosotros. Ahora escucha bien…"],
            ["thinking", "Muy difícil de pensar no lo es, porque cada mes puede llegar."],
            ["wink", "Muy chistoso mi parecer: en este lugar podrían estar, si es que invierno no lo fuese."]
        ],
        apartment: [
            ["tender", "Ya solo unos días y Navidad… Pero para este, pista no habrá."],
            ["thinking", "Porque este largo camino a mis pies no los ha complacido…"],
            ["wink", "Espero que tengas una nueva pisada que te cambie la cara. ♡"]
        ]
    }
};
