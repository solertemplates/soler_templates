// Biblioteca de contenido: temas, situaciones, ganchos, reflexiones y llamados a la acción.
// Cada línea: L(es, en, acciones, prop, sfx)
//  acciones: "A:talk B:shrug"  (roles A, B, C, D) o "all:laugh"
//  prop: "clock:8:00", "money", "pizza", "sign:Izq|Der", "left"/"right" (en caminos)...
//  sfx: pop, boing, ding, whoosh, scratch, applause, cash, sad, drum, type, heart, alarm, laugh, notif

const L = (es, en, a = '', p = '', fx = '', core = false) => ({ t: { es, en }, a, p, fx, core });
const R = (es, en) => ({ es, en });

export const THEMES = [
  { id: 'amistad', emoji: '🤝', name: R('Amistad', 'Friendship') },
  { id: 'matrimonio', emoji: '💍', name: R('Matrimonio', 'Marriage') },
  { id: 'trabajo', emoji: '💼', name: R('Trabajo', 'Work') },
  { id: 'emprendimiento', emoji: '🚀', name: R('Emprendimiento', 'Business') },
  { id: 'familia', emoji: '🏡', name: R('Familia', 'Family') },
  { id: 'dinero', emoji: '💰', name: R('Dinero', 'Money') },
  { id: 'habitos', emoji: '🏃', name: R('Hábitos', 'Habits') },
  { id: 'redes', emoji: '📱', name: R('Redes sociales', 'Social media') },
];

export const ENVIRONMENTS = [
  { id: 'auto', emoji: '✨', name: R('Automático', 'Automatic') },
  { id: 'oficina', emoji: '🏢', name: R('Oficina', 'Office') },
  { id: 'casa', emoji: '🛋️', name: R('Casa', 'Home') },
  { id: 'parque', emoji: '🌳', name: R('Parque', 'Park') },
  { id: 'cafe', emoji: '☕', name: R('Café', 'Coffee shop') },
  { id: 'ciudad', emoji: '🏙️', name: R('Ciudad', 'City') },
  { id: 'playa', emoji: '🏖️', name: R('Playa', 'Beach') },
  { id: 'cocina', emoji: '🍳', name: R('Cocina', 'Kitchen') },
  { id: 'vacio', emoji: '⬜', name: R('Fondo liso', 'Plain') },
];

// mode: 'esc' = repetición que sube + giro final | 'caminos' = alegoría de dos caminos
export const SITUATIONS = {
  amistad: [
    {
      id: 'tarde', env: 'cafe', mode: 'esc',
      title: R('El amigo que siempre llega tarde', 'The friend who is always late'),
      hook: R('¿Tienes un amigo que NUNCA llega a tiempo?', 'Got a friend who is NEVER on time?'),
      setup: [L('Quedamos a las 8 en punto.', 'We said 8 o\'clock sharp.', 'A:phone', 'clock:8:00', 'pop')],
      reps: [
        L('8:10. "Ya casi llego."', '8:10. "Almost there."', 'A:wait', 'clock:8:10', 'notif'),
        L('8:30. "Estoy saliendo."', '8:30. "Just leaving."', 'A:tired', 'clock:8:30', 'notif'),
        L('9:00. "Cinco minutitos."', '9:00. "Five more minutes."', 'A:facepalm', 'clock:9:00', 'boing'),
        L('9:45. El mesero ya me conoce.', '9:45. The waiter knows my name now.', 'A:sit', 'clock:9:45', 'pop'),
        L('10:30. Ya pedí hasta el postre.', '10:30. I already ordered dessert.', 'A:sad', 'clock:10:30', 'sad'),
        L('11:00. Ahora el mesero es mi mejor amigo.', '11:00. The waiter is my best friend now.', 'A:laugh', 'clock:11:00', 'laugh'),
      ],
      twist: L('Llega con un pastel: era MI cumpleaños y yo lo olvidé.', 'He shows up with a cake: it was MY birthday and I forgot.', 'B:give A:shock', 'gift', 'scratch'),
      after: L('Pasó tres horas organizando la sorpresa.', 'He spent three hours planning the surprise.', 'all:cheer', 'confetti', 'applause'),
      reflect: [R('A veces quien llega tarde, llega con el corazón lleno.', 'Sometimes the one who arrives late, arrives with a full heart.'), R('Cuida a los amigos que siempre vuelven por ti.', 'Keep the friends who always come back for you.')],
    },
    {
      id: 'favores', env: 'casa', mode: 'esc',
      title: R('El amigo que solo llama para pedir favores', 'The friend who only calls for favors'),
      hook: R('Ese amigo que solo te llama cuando necesita algo...', 'That friend who only calls when he needs something...'),
      setup: [L('Suena el teléfono. Es Carlos.', 'The phone rings. It\'s Carlos.', 'A:phone', 'phone', 'notif')],
      reps: [
        L('"¿Me prestas tu taladro?"', '"Can I borrow your drill?"', 'B:talk A:shrug', '', 'pop'),
        L('"¿Me llevas al aeropuerto?"', '"Can you drive me to the airport?"', 'B:talk A:tired', '', 'pop'),
        L('"¿Me ayudas con la mudanza?"', '"Can you help me move?"', 'A:lift B:point', 'box', 'boing'),
        L('"¿Me prestas dinero? Te pago el lunes."', '"Can you lend me money? I\'ll pay Monday."', 'B:talk A:facepalm', 'money', 'cash'),
        L('"¿Me cuidas al perro... dos semanas?"', '"Can you watch my dog... for two weeks?"', 'B:talk A:shock', '', 'boing'),
        L('"Oye, ¿me donas un riñón?"', '"Hey, could you spare a kidney?"', 'B:talk A:shock', '', 'drum'),
      ],
      twist: L('Pero el día que perdí todo, fue el primero en llegar.', 'But the day I lost everything, he was the first to show up.', 'B:run A:sad', '', 'scratch'),
      after: L('Sin preguntar. Sin pedir nada a cambio.', 'No questions. Nothing in return.', 'A:hug B:hug', 'heart', 'heart'),
      reflect: [R('Los amigos de verdad no llevan la cuenta.', 'Real friends don\'t keep score.'), R('Solo aparecen cuando más los necesitas.', 'They just show up when you need them most.')],
    },
    {
      id: 'razon', env: 'caminos', mode: 'caminos',
      title: R('Dos caminos: tener la razón o tener al amigo', 'Two paths: being right or keeping your friend'),
      hook: R('Una pelea tonta puede costarte una amistad.', 'One silly fight can cost you a friendship.'),
      setup: [L('Una discusión tonta. Dos caminos.', 'A silly argument. Two paths.', 'A:angry B:angry', 'sign:Tener la razón|Tener al amigo|Being right|Keeping the friend', 'whoosh')],
      reps: [
        L('Camino uno: ganas la discusión.', 'Path one: you win the argument.', 'A:cheer', 'left', 'ding', true),
        L('Pero celebras solo.', 'But you celebrate alone.', 'A:sad', 'left', 'sad', true),
        L('Camino dos: pides perdón.', 'Path two: you say sorry.', 'A:talk B:idle', 'right', 'pop', true),
        L('Y se siguen riendo veinte años después.', 'And you\'re still laughing twenty years later.', 'all:laugh', 'right', 'laugh', true),
        L('Uno tiene un trofeo vacío.', 'One holds an empty trophy.', 'A:sad', 'left', 'sad'),
        L('El otro tiene mil historias.', 'The other has a thousand stories.', 'all:dance', 'right', 'ding'),
      ],
      twist: L('Lo curioso: ninguno recuerda por qué peleaban.', 'Funny part: nobody remembers what the fight was about.', 'all:shrug', '', 'scratch'),
      reflect: [R('Hay victorias que salen carísimas.', 'Some victories are way too expensive.'), R('Elige personas, no discusiones.', 'Choose people, not arguments.')],
    },
  ],
  matrimonio: [
    {
      id: 'cenar', env: 'casa', mode: 'esc',
      title: R('"¿Dónde quieres cenar?"', '"Where do you want to eat?"'),
      hook: R('La pregunta más difícil del matrimonio...', 'The hardest question in any marriage...'),
      setup: [L('"Amor, ¿dónde cenamos?" "Donde tú quieras."', '"Babe, where should we eat?" "Wherever you want."', 'A:talk B:shrug', '', 'pop')],
      reps: [
        L('"¿Pizza?" "Mmm... no."', '"Pizza?" "Mmm... no."', 'A:talk B:idle', 'pizza', 'boing'),
        L('"¿Sushi?" "Muy caro."', '"Sushi?" "Too pricey."', 'A:talk B:shrug', 'money', 'boing'),
        L('"¿Tacos?" "Muy pesado."', '"Tacos?" "Too heavy."', 'A:think B:idle', '', 'boing'),
        L('"¿Hamburguesa?" "Ayer comimos."', '"Burgers?" "We had them yesterday."', 'A:facepalm B:talk', '', 'boing'),
        L('"¿Cocino yo?" Silencio total.', '"Should I cook?" Dead silence.', 'A:shock B:idle', '', 'drum'),
        L('Una hora después, seguimos sin cenar.', 'One hour later, still no dinner.', 'all:tired', 'clock:21:30', 'sad'),
      ],
      twist: L('Al final... pedimos pizza. La primera opción.', 'In the end... we ordered pizza. The very first option.', 'all:facepalm', 'pizza', 'scratch'),
      after: L('Y fue la mejor noche de la semana.', 'And it was the best night of the week.', 'all:laugh', 'heart', 'laugh'),
      reflect: [R('El matrimonio no es estar de acuerdo en todo.', 'Marriage isn\'t agreeing on everything.'), R('Es querer seguir decidiendo juntos, aunque tarden una hora.', 'It\'s choosing to decide together, even if it takes an hour.')],
    },
    {
      id: 'detalles', env: 'cocina', mode: 'esc',
      title: R('El que lo olvida todo... menos una cosa', 'He forgets everything... except one thing'),
      hook: R('Mi esposo olvida TODO. Pero mira lo que nunca olvida.', 'My husband forgets EVERYTHING. But watch what he never forgets.'),
      setup: [L('Él nunca recuerda nada.', 'He never remembers anything.', 'A:think', 'bulb', 'pop')],
      reps: [
        L('Olvidó el aniversario.', 'He forgot our anniversary.', 'A:shock B:angry', 'calendar', 'boing'),
        L('Olvidó el cumpleaños de su suegra.', 'He forgot his mother-in-law\'s birthday.', 'A:facepalm', 'gift', 'boing'),
        L('Buscó las llaves... que tenía en la mano.', 'He searched for the keys... in his hand.', 'A:think', '', 'pop'),
        L('Olvidó comprar el pan. Tres veces.', 'He forgot the bread. Three times.', 'A:shrug B:facepalm', '', 'boing'),
        L('Olvidó dónde estacionó el carro.', 'He forgot where he parked the car.', 'A:tired', '', 'pop'),
        L('Casi olvida su propio cumpleaños.', 'He almost forgot his own birthday.', 'A:shock', 'gift', 'drum'),
      ],
      twist: L('Pero nunca, nunca olvida cómo le gusta el café a ella.', 'But he never, ever forgets how she likes her coffee.', 'A:give B:love', 'coffee', 'scratch'),
      after: L('Veinte años. Todas las mañanas.', 'Twenty years. Every single morning.', 'A:hug B:hug', 'heart', 'heart'),
      reflect: [R('El amor no vive en las fechas grandes.', 'Love doesn\'t live in big dates.'), R('Vive en los pequeños detalles de todos los días.', 'It lives in the small details of every day.')],
    },
    {
      id: 'celular', env: 'caminos', mode: 'caminos',
      title: R('Dos caminos: el celular o la mirada', 'Two paths: the phone or each other'),
      hook: R('Así se apaga un matrimonio sin que nadie lo note.', 'This is how a marriage fades without anyone noticing.'),
      setup: [L('Una cena en casa. Dos caminos.', 'Dinner at home. Two paths.', 'A:idle B:idle', 'sign:El celular|Mirarse|The phone|Each other', 'whoosh')],
      reps: [
        L('Camino uno: cada uno en su celular.', 'Path one: each one on their phone.', 'A:phone B:phone', 'left', 'notif', true),
        L('Juntos, pero a kilómetros de distancia.', 'Together, but miles apart.', 'all:sad', 'left', 'sad', true),
        L('Camino dos: guardan el celular.', 'Path two: phones go away.', 'A:talk B:idle', 'right', 'pop', true),
        L('Y se vuelven a enamorar.', 'And they fall in love again.', 'A:love B:love', 'right', 'heart', true),
        L('Mil likes y ni una sola risa.', 'A thousand likes, not one laugh.', 'A:phone', 'left', 'notif'),
        L('Una charla que dura hasta la madrugada.', 'A talk that lasts until dawn.', 'all:laugh', 'right', 'laugh'),
      ],
      twist: L('Spoiler: el celular nunca te va a abrazar.', 'Spoiler: your phone will never hug you back.', 'A:hug B:hug', '', 'scratch'),
      reflect: [R('La presencia es el regalo más valioso.', 'Presence is the most valuable gift.'), R('Y el único que no se puede comprar.', 'And the only one money can\'t buy.')],
    },
  ],
  trabajo: [
    {
      id: 'reunion', env: 'oficina', mode: 'esc',
      title: R('La reunión que pudo ser un correo', 'The meeting that could have been an email'),
      hook: R('Si trabajas en oficina, esto te va a doler.', 'If you work in an office, this will hurt.'),
      setup: [L('Reunión urgente a las 9.', 'Urgent meeting at 9.', 'A:walk', 'clock:9:00', 'alarm')],
      reps: [
        L('9:00. "Esperemos a que lleguen todos."', '9:00. "Let\'s wait for everyone."', 'A:wait', 'clock:9:00', 'pop'),
        L('9:20. "¿Me escuchan? ¿Me escuchan?"', '9:20. "Can you hear me? Hello?"', 'B:talk A:facepalm', 'laptop', 'boing'),
        L('9:45. Diapositiva 3 de 87.', '9:45. Slide 3 of 87.', 'A:sleep', 'chart_up', 'pop'),
        L('10:30. Alguien comparte la pantalla equivocada.', '10:30. Someone shares the wrong screen.', 'all:shock', 'laptop', 'drum'),
        L('11:00. "Lo vemos en otra reunión."', '11:00. "Let\'s discuss it in another meeting."', 'B:talk A:tired', 'clock:11:00', 'sad'),
        L('12:00. Reunión para planear la reunión.', '12:00. A meeting to plan the meeting.', 'all:tired', 'calendar', 'boing'),
      ],
      twist: L('Conclusión final: "Mejor les mando un correo."', 'Final conclusion: "I\'ll just send you an email."', 'all:facepalm', 'laptop', 'scratch'),
      reflect: [R('El tiempo es lo único que nunca se recupera.', 'Time is the one thing you never get back.'), R('Respeta el tuyo y el de los demás.', 'Respect yours and everyone else\'s.')],
    },
    {
      id: 'lunes', env: 'casa', mode: 'esc',
      title: R('Lunes: la guerra contra la alarma', 'Monday: the war against the alarm'),
      hook: R('Nadie odia los lunes tanto como yo. Mira.', 'Nobody hates Mondays more than me. Watch.'),
      setup: [L('Lunes, seis de la mañana. Suena la alarma.', 'Monday, 6 a.m. The alarm goes off.', 'A:sleep', 'clock:6:00', 'alarm')],
      reps: [
        L('Pospuesta número uno.', 'Snooze number one.', 'A:sleep', 'clock:6:10', 'alarm'),
        L('Pospuesta número cinco.', 'Snooze number five.', 'A:sleep', 'clock:6:50', 'alarm'),
        L('Se me hizo tarde. Café doble, sin respirar.', 'Running late. Double coffee, no breathing.', 'A:run', 'coffee', 'whoosh'),
        L('Tráfico infernal.', 'Hellish traffic.', 'A:angry', 'clock:8:40', 'boing'),
        L('Corro tres cuadras con la corbata al revés.', 'I run three blocks with my tie on backwards.', 'A:run', '', 'whoosh'),
        L('Llego sudando. La oficina está vacía.', 'I arrive sweating. The office is empty.', 'A:tired', '', 'drum'),
      ],
      twist: L('Mensaje del jefe: "¡Feliz feriado a todos!"', 'Message from the boss: "Happy holiday, everyone!"', 'A:shock', 'phone', 'scratch'),
      after: L('Y yo, en la oficina, solo con mi café.', 'And there I am, alone at the office with my coffee.', 'A:facepalm', 'coffee', 'sad'),
      reflect: [R('No vivas solo esperando el viernes.', 'Don\'t live just waiting for Friday.'), R('Construye una vida de la que no quieras escapar los lunes.', 'Build a life you don\'t want to escape on Mondays.')],
    },
    {
      id: 'quejarse', env: 'caminos', mode: 'caminos',
      title: R('Dos caminos: quejarse o aprender', 'Two paths: complain or learn'),
      hook: R('Tu jefe te da un proyecto imposible. ¿Qué haces?', 'Your boss hands you an impossible project. What do you do?'),
      setup: [L('Un proyecto difícil. Dos caminos.', 'A tough project. Two paths.', 'A:shock', 'sign:Quejarme|Aprender|Complain|Learn', 'whoosh')],
      reps: [
        L('Camino uno: te quejas todo el día.', 'Path one: you complain all day.', 'A:angry', 'left', 'boing', true),
        L('Y el proyecto sigue igual de difícil.', 'And the project is still just as hard.', 'A:tired', 'left', 'sad', true),
        L('Camino dos: aprendes algo nuevo.', 'Path two: you learn something new.', 'A:think', 'right', 'ding', true),
        L('Un año después, tú eres el jefe.', 'A year later, you\'re the boss.', 'A:strong', 'right', 'applause', true),
        L('Cada lunes, la misma queja.', 'Every Monday, the same complaint.', 'A:angry', 'left', 'boing'),
        L('Cada error, una lección.', 'Every mistake, a lesson.', 'A:cheer', 'right', 'ding'),
      ],
      twist: L('¿Y adivina quién te pide ayuda ahora? El que se quejaba.', 'And guess who asks you for help now? The one who complained.', 'B:sad A:point', 'trophy', 'scratch'),
      reflect: [R('Los problemas no cambian.', 'Problems don\'t change.'), R('Cambia quien decides ser frente a ellos.', 'What changes is who you choose to be when you face them.')],
    },
  ],
  emprendimiento: [
    {
      id: 'mama', env: 'ciudad', mode: 'esc',
      title: R('Mi primer negocio y mi única clienta', 'My first business and my only customer'),
      hook: R('Así le fue a mi negocio el primer año...', 'Here\'s how my business did in its first year...'),
      setup: [L('Abrí mi negocio con toda la ilusión.', 'I opened my business full of hope.', 'A:cheer', 'box', 'ding')],
      reps: [
        L('Día uno: cero clientes.', 'Day one: zero customers.', 'A:wait', 'chart_down', 'sad'),
        L('Día dos: vino mi mamá.', 'Day two: my mom came by.', 'B:walk A:cheer', 'heart', 'pop'),
        L('Día cinco: vino mi mamá... otra vez.', 'Day five: my mom came... again.', 'B:walk A:shrug', '', 'boing'),
        L('Día diez: mi mamá trajo a la vecina.', 'Day ten: mom brought the neighbor.', 'B:point C:walk A:cheer', '', 'pop'),
        L('Día treinta: vendí a un desconocido. Lloré.', 'Day thirty: I sold to a stranger. I cried.', 'A:cry', 'money', 'cash'),
        L('Día noventa: ya pago la luz.', 'Day ninety: I can pay the electric bill.', 'A:strong', 'chart_up', 'cash'),
      ],
      twist: L('Día 365: mi mamá ahora trabaja para mí.', 'Day 365: my mom works for me now.', 'B:cheer A:laugh', 'trophy', 'scratch'),
      after: L('Y es la empleada del mes. Todos los meses.', 'Employee of the month. Every month.', 'all:cheer', 'confetti', 'applause'),
      reflect: [R('Todo gran negocio empezó con alguien que creyó en ti.', 'Every great business started with someone who believed in you.'), R('No te rindas antes de que llegue el segundo.', 'Don\'t give up before the second one arrives.')],
    },
    {
      id: 'opinan', env: 'casa', mode: 'esc',
      title: R('Le cuento mi idea a la familia', 'I tell my family about my idea'),
      hook: R('Nunca le cuentes tu idea a tu familia. Mira por qué.', 'Never tell your family your business idea. Here\'s why.'),
      setup: [L('Tengo una idea de negocio. Se la cuento a todos.', 'I have a business idea. I tell everyone.', 'A:talk', 'bulb', 'ding')],
      reps: [
        L('Mi tío: "Eso no funciona."', 'My uncle: "That won\'t work."', 'B:talk A:sad', '', 'boing'),
        L('Mi vecina: "Mejor busca un trabajo serio."', 'My neighbor: "Get a real job."', 'C:talk A:shrug', '', 'boing'),
        L('Mi primo: "Eso ya existe en China."', 'My cousin: "That already exists in China."', 'B:laugh A:facepalm', '', 'boing'),
        L('Mi amigo: "¿Y si fracasas?"', 'My friend: "What if you fail?"', 'B:shrug A:think', '', 'pop'),
        L('Mi suegra: una risita sarcástica.', 'My mother-in-law: a sarcastic giggle.', 'C:laugh A:angry', '', 'laugh'),
        L('Hasta el perro me miró raro.', 'Even the dog gave me a weird look.', 'A:shock', '', 'drum'),
      ],
      twist: L('Un año después... todos me piden descuento.', 'One year later... they all ask me for a discount.', 'all:cheer A:strong', 'money', 'scratch'),
      reflect: [R('Los que dudan de ti no pagan tus sueños.', 'The people who doubt you don\'t pay for your dreams.'), R('Pero aplauden cuando los cumples.', 'But they clap when you make them come true.')],
    },
    {
      id: 'empezar', env: 'caminos', mode: 'caminos',
      title: R('Dos caminos: esperar o empezar', 'Two paths: wait or start'),
      hook: R('El momento perfecto para emprender no existe.', 'The perfect time to start a business doesn\'t exist.'),
      setup: [L('Tienes una idea. Dos caminos.', 'You have an idea. Two paths.', 'A:think', 'sign:Esperar|Empezar|Wait|Start', 'whoosh')],
      reps: [
        L('Camino uno: esperar el momento perfecto.', 'Path one: wait for the perfect moment.', 'A:wait', 'left', 'pop', true),
        L('Diez años después... sigue esperando.', 'Ten years later... still waiting.', 'A:tired', 'left', 'sad', true),
        L('Camino dos: empezar con miedo.', 'Path two: start, even scared.', 'A:walk', 'right', 'whoosh', true),
        L('Caer, aprender, levantarse otra vez.', 'Fall, learn, get back up again.', 'A:fall', 'right', 'boing', true),
        L('Mañana, mañana, siempre mañana.', 'Tomorrow, tomorrow, always tomorrow.', 'A:sleep', 'left', 'pop'),
        L('Un cliente, diez clientes, cien clientes.', 'One customer, ten customers, a hundred.', 'A:cheer', 'right', 'cash'),
      ],
      twist: L('Lo curioso: los dos caminos dan miedo. Solo uno da resultados.', 'Funny thing: both paths are scary. Only one gets results.', 'A:strong', 'rocket', 'scratch'),
      reflect: [R('No necesitas ser grande para empezar.', 'You don\'t have to be great to start.'), R('Pero necesitas empezar para ser grande.', 'But you have to start to become great.')],
    },
  ],
  familia: [
    {
      id: 'sueter', env: 'casa', mode: 'esc',
      title: R('Mamá y el "ponte un suéter"', 'Mom and "put on a sweater"'),
      hook: R('Todas las mamás del mundo dicen esto.', 'Every mom in the world says this.'),
      setup: [L('Hace treinta grados. Mamá dice:', 'It\'s ninety degrees outside. Mom says:', 'B:talk A:idle', '', 'pop')],
      reps: [
        L('"Ponte un suéter."', '"Put on a sweater."', 'B:point A:shrug', '', 'pop'),
        L('"Te vas a enfermar."', '"You\'ll catch a cold."', 'B:talk A:tired', '', 'boing'),
        L('"Abrígate el cuello."', '"Cover your neck."', 'B:talk A:facepalm', '', 'boing'),
        L('"Lleva chaqueta, por si acaso."', '"Take a jacket, just in case."', 'B:give A:shock', '', 'boing'),
        L('"Y una cobija para el carro."', '"And a blanket for the car."', 'B:give A:tired', '', 'boing'),
        L('Parezco un oso en pleno verano.', 'I look like a bear in midsummer.', 'A:sad', '', 'drum'),
      ],
      twist: L('Años después... me escucho diciéndole lo mismo a mi hijo.', 'Years later... I hear myself saying the same thing to my kid.', 'A:point C:shrug', '', 'scratch'),
      reflect: [R('Lo que de niño parecía exageración...', 'What looked like exaggeration as a kid...'), R('era amor en su forma más pura.', 'was love in its purest form.')],
    },
    {
      id: 'abuela', env: 'casa', mode: 'esc',
      title: R('"Mañana llamo a la abuela"', '"I\'ll call grandma tomorrow"'),
      hook: R('Si tienes abuelos, mira esto hasta el final.', 'If you still have grandparents, watch this to the end.'),
      setup: [L('Siempre digo: "Mañana llamo a la abuela."', 'I always say: "I\'ll call grandma tomorrow."', 'A:talk', 'phone', 'pop')],
      reps: [
        L('Lunes: mucho trabajo.', 'Monday: too much work.', 'A:type', 'laptop', 'type'),
        L('Martes: estoy muy cansado.', 'Tuesday: I\'m too tired.', 'A:tired', '', 'sad'),
        L('Miércoles: "El fin de semana, sin falta."', 'Wednesday: "This weekend, for sure."', 'A:shrug', 'calendar', 'pop'),
        L('Sábado: se me pasó.', 'Saturday: I forgot.', 'A:facepalm', '', 'boing'),
        L('Un mes después: "Ya la llamaré."', 'A month later: "I\'ll call her eventually."', 'A:phone', 'calendar', 'pop'),
        L('Mientras, ella mira el teléfono cada tarde.', 'Meanwhile, she checks her phone every evening.', 'B:wait', 'phone', 'sad'),
      ],
      twist: L('Hoy la llamé. Contestó llorando: "Sabía que llamarías."', 'Today I called. She answered in tears: "I knew you would call."', 'A:phone B:cry', 'heart', 'scratch'),
      after: L('Hablamos dos horas. Fue el mejor día de su semana.', 'We talked for two hours. Best day of her week.', 'B:love A:laugh', 'heart', 'heart'),
      reflect: [R('Siempre creemos que habrá tiempo.', 'We always think there will be time.'), R('Llama hoy. Mañana no está garantizado.', 'Call today. Tomorrow isn\'t promised.')],
    },
    {
      id: 'jugar', env: 'caminos', mode: 'caminos',
      title: R('Dos caminos: "ahora no" o "vamos a jugar"', 'Two paths: "not now" or "let\'s play"'),
      hook: R('Tu hijo te pide jugar. Lo que hagas cambia todo.', 'Your kid asks you to play. What you do changes everything.'),
      setup: [L('Tu hijo te pide jugar. Dos caminos.', 'Your kid wants to play. Two paths.', 'C:jump A:idle', 'sign:Ahora no|Vamos a jugar|Not now|Let\'s play', 'whoosh')],
      reps: [
        L('Camino uno: "Ahora no, estoy ocupado."', 'Path one: "Not now, I\'m busy."', 'A:phone C:sad', 'left', 'notif', true),
        L('Años después, él te dice lo mismo.', 'Years later, he says the same to you.', 'C:phone A:sad', 'left', 'sad', true),
        L('Camino dos: sueltas todo y juegas.', 'Path two: you drop everything and play.', 'A:dance C:dance', 'right', 'ding', true),
        L('Y te conviertes en su recuerdo favorito.', 'And you become his favorite memory.', 'A:hug C:hug', 'right', 'heart', true),
        L('Un correo más, una tarde menos.', 'One more email, one less afternoon.', 'A:type', 'left', 'type'),
        L('Una risa que dura toda la vida.', 'A laugh that lasts a lifetime.', 'all:laugh', 'right', 'laugh'),
      ],
      twist: L('Spoiler: el correo podía esperar. La infancia, no.', 'Spoiler: the email could wait. Childhood can\'t.', 'A:shock', 'clock:', 'scratch'),
      reflect: [R('Los niños no recuerdan lo que les compraste.', 'Kids don\'t remember what you bought them.'), R('Recuerdan el tiempo que les diste.', 'They remember the time you gave them.')],
    },
  ],
  dinero: [
    {
      id: 'ahorro', env: 'ciudad', mode: 'esc',
      title: R('"Este mes sí ahorro"', '"This month I\'m saving for real"'),
      hook: R('Me prometí ahorrar este mes. Mira lo que pasó.', 'I promised to save money this month. Look what happened.'),
      setup: [L('Día uno del mes: "Este mes sí ahorro."', 'Day one: "This month I\'m saving."', 'A:strong', 'money', 'cash')],
      reps: [
        L('Día dos: solo un cafecito.', 'Day two: just one little coffee.', 'A:idle', 'coffee', 'pop'),
        L('Día cinco: estaba en oferta.', 'Day five: it was on sale.', 'A:cheer', 'gift', 'cash'),
        L('Día diez: "Me lo merezco."', 'Day ten: "I deserve it."', 'A:dance', 'gift', 'cash'),
        L('Día quince: comida a domicilio, por cansancio.', 'Day fifteen: takeout, because I\'m tired.', 'A:tired', 'pizza', 'notif'),
        L('Día veinte: arroz con fe.', 'Day twenty: rice and prayers.', 'A:sad', '', 'sad'),
        L('Día treinta: ¿dónde está mi dinero?', 'Day thirty: where did my money go?', 'A:shock', 'chart_down', 'drum'),
      ],
      twist: L('Revisé: los cafecitos sumaban más que el alquiler.', 'I checked: the coffees added up to more than my rent.', 'A:facepalm', 'coffee', 'scratch'),
      reflect: [R('No se trata de cuánto ganas.', 'It\'s not about how much you earn.'), R('Se trata de cuánto respetas lo que ganas.', 'It\'s about how much you respect what you earn.')],
    },
    {
      id: 'vecino', env: 'ciudad', mode: 'esc',
      title: R('Competencia con el vecino', 'Keeping up with the neighbor'),
      hook: R('Mi vecino y yo empezamos una guerra silenciosa.', 'My neighbor and I started a silent war.'),
      setup: [L('Mi vecino se compró un carro nuevo.', 'My neighbor bought a brand new car.', 'B:cheer A:shock', '', 'pop')],
      reps: [
        L('Yo me compré uno mejor. A crédito.', 'I bought a better one. On credit.', 'A:cheer', 'money', 'cash'),
        L('Él compró una tele gigante.', 'He bought a giant TV.', 'B:cheer', '', 'pop'),
        L('Yo, una más grande. A crédito.', 'I got a bigger one. On credit.', 'A:strong', 'money', 'cash'),
        L('Él se fue de viaje a Europa.', 'He went on a trip to Europe.', 'B:dance', '', 'pop'),
        L('Yo también. En treinta y seis cuotas.', 'Me too. In thirty-six payments.', 'A:dance', 'money', 'cash'),
        L('Ya no duermo pensando en las deudas.', 'Now I can\'t sleep because of the debt.', 'A:tired', 'chart_down', 'sad'),
      ],
      twist: L('Un día me confesó: él también lo hacía para competir conmigo.', 'One day he confessed: he was doing it to compete with me.', 'all:facepalm', '', 'scratch'),
      after: L('Dos amigos, dos deudas y cero paz.', 'Two friends, two debts, zero peace.', 'A:laugh B:laugh', '', 'laugh'),
      reflect: [R('Compramos cosas que no necesitamos...', 'We buy things we don\'t need...'), R('para impresionar a gente que ni nos importa.', 'to impress people we don\'t even care about.')],
    },
    {
      id: 'sueldo', env: 'caminos', mode: 'caminos',
      title: R('Dos caminos: gastar todo o invertir un poco', 'Two paths: spend it all or invest a little'),
      hook: R('Lo que haces con tu sueldo decide tu futuro.', 'What you do with your paycheck decides your future.'),
      setup: [L('Te llega el sueldo. Dos caminos.', 'Payday. Two paths.', 'A:cheer', 'sign:Gastarlo todo|Invertir un poco|Spend it all|Invest a little', 'cash')],
      reps: [
        L('Camino uno: lo gastas todo en un fin de semana.', 'Path one: you blow it all in one weekend.', 'A:dance', 'left', 'cash', true),
        L('El lunes, a esperar el próximo sueldo.', 'Monday, waiting for the next paycheck.', 'A:sad', 'left', 'sad', true),
        L('Camino dos: guardas un poco cada mes.', 'Path two: you save a little every month.', 'A:idle', 'right', 'pop', true),
        L('Diez años después, tu dinero trabaja por ti.', 'Ten years later, your money works for you.', 'A:strong', 'right', 'cash', true),
        L('Mucho brillo, poco futuro.', 'Lots of shine, little future.', 'A:dance', 'left', 'pop'),
        L('Poco a poco, la planta crece.', 'Little by little, the plant grows.', 'A:cheer', 'right', 'ding'),
      ],
      twist: L('Lo mejor: el del camino dos también se divirtió. Solo que con calma.', 'Best part: path two had fun too. Just slower.', 'A:laugh', 'plant', 'scratch'),
      reflect: [R('La libertad financiera no es suerte.', 'Financial freedom isn\'t luck.'), R('Son pequeñas decisiones repetidas cada mes.', 'It\'s small decisions repeated every month.')],
    },
  ],
  habitos: [
    {
      id: 'gym', env: 'parque', mode: 'esc',
      title: R('El gimnasio en enero', 'The gym in January'),
      hook: R('Mi relación con el gimnasio, resumida.', 'My relationship with the gym, summed up.'),
      setup: [L('Enero: "Este año me pongo en forma."', 'January: "This year I get in shape."', 'A:strong', 'calendar', 'ding')],
      reps: [
        L('Semana uno: gimnasio todos los días.', 'Week one: gym every single day.', 'A:strong', '', 'pop'),
        L('Semana dos: día de descanso. Tres días.', 'Week two: rest day. Three days.', 'A:sleep', '', 'boing'),
        L('Semana tres: "Hoy llueve."', 'Week three: "It\'s raining today."', 'A:shrug', '', 'boing'),
        L('Semana cuatro: "Mañana sin falta."', 'Week four: "Tomorrow, for sure."', 'A:sleep', '', 'boing'),
        L('Febrero: pago el gimnasio para nada.', 'February: paying the gym for nothing.', 'A:sad', 'money', 'cash'),
        L('Marzo: el gimnasio me manda una postal: "Te extrañamos."', 'March: the gym sends a card: "We miss you."', 'A:facepalm', 'heart', 'drum'),
      ],
      twist: L('Probé al revés: solo cinco minutos al día. Hoy llevo un año.', 'So I flipped it: just five minutes a day. It\'s been a year.', 'A:strong', 'trophy', 'scratch'),
      reflect: [R('No necesitas una motivación gigante.', 'You don\'t need giant motivation.'), R('Necesitas un paso pequeño que no abandones.', 'You need one small step you never quit.')],
    },
    {
      id: 'dormir', env: 'casa', mode: 'esc',
      title: R('"Hoy me duermo temprano"', '"Tonight I\'m going to bed early"'),
      hook: R('Hoy me duermo temprano. (Spoiler: no.)', 'Tonight I sleep early. (Spoiler: nope.)'),
      setup: [L('Diez de la noche: "Hoy me duermo temprano."', '10 p.m.: "Tonight I sleep early."', 'A:sleep', 'clock:22:00', 'pop')],
      reps: [
        L('Diez y cuarto: solo un video cortito.', '10:15: just one short video.', 'A:phone', 'clock:22:15', 'notif'),
        L('Once: otro video. El último.', '11:00: another video. The last one.', 'A:phone', 'clock:23:00', 'notif'),
        L('Doce y media: aprendo a hacer pan japonés.', '12:30: learning to bake Japanese bread.', 'A:think', 'clock:0:30', 'pop'),
        L('Dos de la mañana: la vida secreta de las ballenas.', '2 a.m.: the secret life of whales.', 'A:shock', 'clock:2:00', 'boing'),
        L('Tres: teorías conspirativas sobre palomas.', '3 a.m.: pigeon conspiracy theories.', 'A:shock', 'clock:3:00', 'drum'),
        L('Seis: suena la alarma.', '6 a.m.: the alarm rings.', 'A:tired', 'clock:6:00', 'alarm'),
      ],
      twist: L('El último video que vi: "Cómo dormir mejor."', 'The last video I watched: "How to sleep better."', 'A:facepalm', 'phone', 'scratch'),
      reflect: [R('Lo que haces cada noche...', 'What you do every night...'), R('decide quién eres cada mañana.', 'decides who you are every morning.')],
    },
    {
      id: 'hoy', env: 'caminos', mode: 'caminos',
      title: R('Dos caminos: "mañana empiezo" o "hoy empiezo"', 'Two paths: "tomorrow" or "today"'),
      hook: R('La frase que más sueños ha matado: "mañana empiezo".', 'The phrase that kills the most dreams: "I\'ll start tomorrow."'),
      setup: [L('Quieres cambiar tu vida. Dos caminos.', 'You want to change your life. Two paths.', 'A:think', 'sign:Mañana empiezo|Hoy empiezo|Tomorrow|Today', 'whoosh')],
      reps: [
        L('Camino uno: "Mañana empiezo."', 'Path one: "I\'ll start tomorrow."', 'A:sleep', 'left', 'pop', true),
        L('Un año después: "Mañana empiezo."', 'One year later: "I\'ll start tomorrow."', 'A:tired', 'left', 'sad', true),
        L('Camino dos: un paso pequeño, hoy.', 'Path two: one small step, today.', 'A:walk', 'right', 'pop', true),
        L('Un año después, no te reconoces.', 'One year later, you don\'t recognize yourself.', 'A:strong', 'right', 'applause', true),
        L('Mismo sillón, misma excusa.', 'Same couch, same excuse.', 'A:sit', 'left', 'boing'),
        L('Cada día, uno por ciento mejor.', 'Every day, one percent better.', 'A:run', 'right', 'ding'),
      ],
      twist: L('La diferencia entre los dos... fue un solo día.', 'The difference between them... was just one day.', 'A:shock', 'calendar', 'scratch'),
      reflect: [R('Dentro de un año desearás haber empezado hoy.', 'A year from now, you\'ll wish you had started today.'), R('Empieza pequeño, pero empieza hoy.', 'Start small, but start today.')],
    },
  ],
  redes: [
    {
      id: 'foto', env: 'cafe', mode: 'esc',
      title: R('La foto perfecta para redes', 'The perfect photo for social media'),
      hook: R('Lo que hay detrás de UNA foto para Instagram.', 'What goes into ONE photo for Instagram.'),
      setup: [L('Vamos a tomar una foto para redes.', 'Let\'s take a photo for social media.', 'A:phone B:idle', 'phone', 'pop')],
      reps: [
        L('Foto uno: ojos cerrados.', 'Photo one: eyes closed.', 'A:phone B:sleep', '', 'pop'),
        L('Foto quince: mal ángulo.', 'Photo fifteen: bad angle.', 'A:phone B:shrug', '', 'pop'),
        L('Foto cuarenta: la luz no ayuda.', 'Photo forty: the lighting is wrong.', 'A:facepalm', '', 'boing'),
        L('Foto ochenta: filtro, recorte y más filtro.', 'Photo eighty: filter, crop, more filter.', 'A:phone', 'phone', 'boing'),
        L('Foto ciento veinte: la comida ya está fría.', 'Photo one hundred twenty: the food is cold now.', 'B:sad', 'pizza', 'sad'),
        L('Foto doscientos: ¡perfecta!', 'Photo two hundred: perfect!', 'A:cheer', 'phone', 'ding'),
      ],
      twist: L('Tres likes. Uno era de mi mamá.', 'Three likes. One was my mom.', 'A:facepalm', 'heart', 'scratch'),
      after: L('Y el otro, de mi otra cuenta.', 'And another one was my second account.', 'B:laugh A:shrug', '', 'laugh'),
      reflect: [R('La vida no necesita filtros para ser bonita.', 'Life doesn\'t need filters to be beautiful.'), R('Necesita que la vivas.', 'It needs you to live it.')],
    },
    {
      id: 'grupo', env: 'casa', mode: 'esc',
      title: R('El grupo familiar de WhatsApp', 'The family group chat'),
      hook: R('Todos tenemos un grupo familiar así.', 'We all have a family group chat like this.'),
      setup: [L('Grupo familiar: un mensaje nuevo.', 'Family group chat: one new message.', 'A:phone', 'phone', 'notif')],
      reps: [
        L('La tía: "Buenos días" con flores brillantes.', 'Auntie: "Good morning" with glittery flowers.', 'A:phone', 'phone', 'notif'),
        L('El tío: una noticia falsa.', 'Uncle: a fake news story.', 'A:facepalm', 'phone', 'notif'),
        L('La abuela: un audio de ocho minutos.', 'Grandma: an eight-minute voice note.', 'A:shock', 'phone', 'notif'),
        L('El primo: un sticker que nadie entiende.', 'Cousin: a sticker nobody understands.', 'A:think', 'phone', 'notif'),
        L('Mamá: "¿Por qué nadie contesta?"', 'Mom: "Why is nobody answering?"', 'A:tired', 'phone', 'notif'),
        L('Trescientos cuarenta y siete mensajes sin leer.', 'Three hundred forty-seven unread messages.', 'A:shock', 'phone', 'drum'),
      ],
      twist: L('Un día se fue el internet... y todos fuimos a casa de la abuela.', 'One day the internet went down... and we all went to grandma\'s.', 'all:hug', 'heart', 'scratch'),
      reflect: [R('Los mensajes conectan.', 'Messages connect us.'), R('Pero los abrazos unen.', 'But hugs bring us together.')],
    },
    {
      id: 'comparar', env: 'caminos', mode: 'caminos',
      title: R('Dos caminos: compararte o vivir', 'Two paths: compare or live'),
      hook: R('Esto te pasa cada vez que abres Instagram.', 'This happens every time you open Instagram.'),
      setup: [L('Abres Instagram. Dos caminos.', 'You open Instagram. Two paths.', 'A:phone', 'sign:Compararme|Vivir mi vida|Compare|Live my life', 'notif')],
      reps: [
        L('Camino uno: comparas tu vida con todos.', 'Path one: you compare your life to everyone.', 'A:phone', 'left', 'notif', true),
        L('Y nada es suficiente.', 'And nothing is ever enough.', 'A:cry', 'left', 'sad', true),
        L('Camino dos: cierras la app y sales a vivir.', 'Path two: you close the app and go live.', 'A:walk', 'right', 'whoosh', true),
        L('Y descubres que tu vida ya era buena.', 'And you find out your life was already good.', 'A:love', 'right', 'heart', true),
        L('Viajes ajenos, cuerpos ajenos, vidas ajenas.', 'Other people\'s trips, bodies, lives.', 'A:sad', 'left', 'notif'),
        L('Tu café, tu gente, tu atardecer.', 'Your coffee, your people, your sunset.', 'all:laugh', 'right', 'ding'),
      ],
      twist: L('Spoiler: los de las fotos perfectas también se comparan.', 'Spoiler: the people with perfect photos compare too.', 'B:sad', '', 'scratch'),
      reflect: [R('No compares tu detrás de cámaras...', 'Don\'t compare your behind-the-scenes...'), R('con el mejor momento de alguien más.', 'with someone else\'s highlight reel.')],
    },
  ],
};

// Ganchos genéricos por tema (se combinan con el gancho propio de la situación)
const THEME_HOOKS = {
  amistad: [R('Etiqueta a ese amigo que es exactamente así.', 'Tag the friend who is exactly like this.'), R('La amistad se prueba en momentos como este.', 'Friendship is tested in moments like this.'), R('Si tienes un amigo así, no lo sueltes.', 'If you have a friend like this, never let go.')],
  matrimonio: [R('Si estás casado, esto te va a sonar familiar.', 'If you\'re married, this will sound familiar.'), R('Nadie te cuenta esto antes de casarte.', 'Nobody tells you this before you get married.'), R('Esto es el matrimonio de verdad. Sin filtros.', 'This is real marriage. No filters.')],
  trabajo: [R('Esto pasa en TODAS las oficinas del mundo.', 'This happens in EVERY office in the world.'), R('Tu jefe no quiere que veas esto.', 'Your boss doesn\'t want you to see this.'), R('Si trabajas, esto es para ti.', 'If you have a job, this is for you.')],
  emprendimiento: [R('Nadie te cuenta esta parte de emprender.', 'Nobody tells you this part of starting a business.'), R('Si estás emprendiendo, necesitas ver esto.', 'If you\'re building a business, you need to see this.'), R('Así empiezan los negocios de verdad.', 'This is how real businesses start.')],
  familia: [R('Esto lo vivimos todos en casa.', 'We all lived this at home.'), R('La familia es así. Y por eso la amamos.', 'Family is like this. And that\'s why we love it.'), R('Mira esto y luego llama a tu familia.', 'Watch this, then call your family.')],
  dinero: [R('Por esto nunca te alcanza el dinero.', 'This is why you never have enough money.'), R('El error de dinero que todos cometemos.', 'The money mistake we all make.'), R('Tu billetera necesita ver esto.', 'Your wallet needs to see this.')],
  habitos: [R('Si siempre empiezas y abandonas, mira esto.', 'If you always start and quit, watch this.'), R('El hábito que cambió mi vida en un año.', 'The habit that changed my life in one year.'), R('Tu yo del futuro te va a agradecer esto.', 'Your future self will thank you for this.')],
  redes: [R('Las redes no te muestran esto.', 'Social media won\'t show you this.'), R('Esto pasa detrás de cada pantalla.', 'This happens behind every screen.'), R('Deja de deslizar un segundo y mira esto.', 'Stop scrolling for a second and watch this.')],
};
const GENERIC_HOOKS = [
  R('No vas a creer cómo termina esto.', 'You won\'t believe how this ends.'),
  R('Mira hasta el final. El giro lo cambia todo.', 'Watch to the end. The twist changes everything.'),
  R('A todos nos ha pasado. Admítelo.', 'It\'s happened to all of us. Admit it.'),
  R('Nadie habla de esto, pero...', 'Nobody talks about this, but...'),
  R('Esto me pasó ayer. Y aprendí algo.', 'This happened to me yesterday. And I learned something.'),
];

// Llamados a la acción. {page} = nombre de la página, {link} = texto del enlace
const CTAS = {
  like: [
    R('Si te pasó, dale me gusta.', 'If this happened to you, hit like.'),
    R('Dale like si te sacó una sonrisa.', 'Like this if it made you smile.'),
    R('Un me gusta si te tocó el corazón.', 'Give it a like if it touched your heart.'),
  ],
  follow: [
    R('Sigue {page} para más historias como esta.', 'Follow {page} for more stories like this.'),
    R('Síguenos: cada día una nueva reflexión.', 'Follow us: a new reflection every day.'),
    R('Sigue la página y no te pierdas la próxima.', 'Follow the page so you don\'t miss the next one.'),
  ],
  stars: [
    R('Apóyanos con estrellas para seguir creando.', 'Support us with stars so we can keep creating.'),
    R('Si te gustó, envíanos unas estrellas.', 'If you liked it, send us some stars.'),
    R('Tus estrellas hacen posible el próximo video.', 'Your stars make the next video possible.'),
  ],
  link: [
    R('Toca el enlace: {link}.', 'Tap the link: {link}.'),
    R('Hay más para ti en el enlace: {link}.', 'There\'s more for you at the link: {link}.'),
    R('Haz clic en el enlace y descubre más.', 'Click the link and discover more.'),
  ],
  combo: [
    R('Dale like, síguenos y compártelo con quien lo necesite.', 'Like, follow, and share it with someone who needs it.'),
    R('Guárdalo, compártelo y síguenos para más.', 'Save it, share it, and follow for more.'),
  ],
};

export const CTA_TYPES = ['like', 'follow', 'stars', 'link', 'combo'];

const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];

export function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hookOptions(themeId, situation, seed = 1) {
  const rnd = mulberry(seed * 7919 + 13);
  const pool = [...THEME_HOOKS[themeId], ...GENERIC_HOOKS];
  const out = [];
  if (seed % 2 === 1 || !situation) { if (situation) out.push(situation.hook); }
  while (out.length < 3) {
    const h = pick(pool, rnd);
    if (!out.includes(h)) out.push(h);
  }
  if (situation && !out.includes(situation.hook) && seed % 2 === 0) out[rnd() < 0.5 ? 0 : 2] = situation.hook;
  return out;
}

export function ctaOptions(seed = 1, hasLink = false) {
  const rnd = mulberry(seed * 104729 + 7);
  let types = CTA_TYPES.filter(t => t !== 'link' || hasLink);
  // baraja y toma 3 tipos distintos
  types = types.map(t => [rnd(), t]).sort((a, b) => a[0] - b[0]).map(x => x[1]).slice(0, 3);
  if (hasLink && !types.includes('link') && seed % 2 === 0) types[2] = 'link';
  return types.map(type => ({ type, text: pick(CTAS[type], rnd) }));
}

export function fillCta(text, lang, settings) {
  const page = (settings.page || '').trim() || (lang === 'es' ? 'la página' : 'the page');
  const link = (settings.linkLabel || settings.linkUrl || '').trim() || (lang === 'es' ? 'en la descripción' : 'in the description');
  return text.replace('{page}', page).replace('{link}', link);
}
