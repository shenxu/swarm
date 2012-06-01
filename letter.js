int nro_linea = 2;
int nro_space = 0;

PFont font, font1, font2, font3, font4;
String par_actual = "";               // current value of scanning the text
String[] lines;                       // scan lines of text
int dragging = -1;

int total_pairs = 0;
float k_total;

int spacebelow;
int spaceup;
int spaceright;
int spaceleft;
String layout_actual = "standard";
String visual_mode = "lineal";
int bubbles_max = 49;
int bubbles_plotted = 0;

Ball[] balls = new Ball[0];
float grav = 1.40;                    // gravity
float b = 0.85;                       // rebound
float f = 0.90;                       // friction

color ColorLineasGrales = color(200);
color ColorAcento = color(255, 102, 0);
color ColorAcentoCompanion = color(255, 180, 0);

int refresh_period = 1;               // at each set of frames, renew the listed item info
int timer_internal = 0;
boolean spring_activated = false;
boolean show_info = true;
boolean fill_bubbles = false;
boolean no_gravity = false;


void setup() {
  size(800, 600);
  background(255);
  smooth();
  loop();  
   
  font = loadFont("Swiss721BT-Bold-48.vlw");
  font1 = loadFont("Swiss721BT-BlackCondensed-25.vlw");
  font2 = loadFont("Swiss721BT-BoldCondensed-18.vlw");
  font3 = loadFont("Swiss721BT-BoldCondensed-14.vlw");
  font4 = loadFont("Swiss721BT-RomanCondensed-18.vlw");
  
  calcularKtotal();
  
  lines = loadStrings("Borges.txt"); // text to be analyzed
  
  layout( font1, font2, font3 );
}

void draw() {  //Text analysis
    if ( nro_linea < lines.length ) {  // within the limits of the text 
      String space = " ";    
      if ( lines[nro_linea].length() > 1 ) {
        par_actual = lines[nro_linea].substring(nro_space, nro_space+2);
        if ( par_actual.charAt(0) != space && par_actual.charAt(1) != space )
          sumarKP( par_actual );
      }
    
      nro_space++;
      if ( nro_space > lines[nro_linea].length()-2 ) {
        nro_space = 0;
        nro_linea++;
      }    

    } else par_actual = ":::";
    
    // refrescar orden de la info    
      timer_internal++;
      if ( timer_internal == refresh_period ) {
        timer_internal = 0;
        ordenarArrays();
      }
    
    background(255);
    
    total_pairs = 0;
    bubbles_plotted = 0;
    for ( int i=bubbles_max; i>=0; i-- ) {
      if ( i < balls.length ) {
        total_pairs += balls[i].occurrences;
        bubbles_plotted++;
      }
    }
    
    calcularKtotal();
    for ( int i=0; i<balls.length; i++ ) {
      float kprima = ( k_total * balls[i].occurrences ) / total_pairs;
      balls[i].ka = kprima;
      balls[i].r = sqrt( ( ( kprima ) / PI ) );
    }
        
    for ( int i=bubbles_max; i>=0; i-- ) {
      if ( i < balls.length ) {
        if ( no_gravity ) balls[i].fall();
        if ( spring_activated ) balls[i].spring();
        balls[i].bounce();
        balls[i].collide();
        balls[i].move();
        balls[i].above();      
        balls[i].display();
      }
    }
      
    layout( font1, font2, font3 );
   
}

void graficando() { // function to plot the top 20
  float tamanio = 45;
  int altura = 140;
  int alpha_value = 255;
  
  for (int i=0; i < 20 && i < balls.length ; i++) {
    textFont(font, tamanio);
    textAlign(CENTER);
    fill(0, 102, 153, alpha_value); 
    text(balls[i].name, width - 50, altura);
    
    tamanio = tamanio * 0.94;
    altura += tamanio-5;
    alpha_value -= 10;
  }
}

void layout( PFont font1, PFont font2, PFont font3 ) {
  if ( layout_actual == "standard" ) {
    spacebelow = 60;
    spaceup = 15;
    spaceright = 100;
    spaceleft = 15;

    rectMode(CORNERS);
    noStroke();
    fill(255);
    rect(width-spaceright+5, 0, width, height);
  
    textFont(font, 48);
    textAlign(CENTER);
    fill(ColorAcento); 
    text(par_actual, width - 50, 75); 
    
    textFont(font3, 14);
    textAlign(CENTER);
    fill(180);
  
    graficando();
  } else if ( layout_actual == "reducido" ) {
    spacebelow = 60;
    spaceup = 20;
    spaceright = 20;
    spaceleft = 20;
  }
  
  // data
  textFont(font1, 25);
  textAlign(LEFT);
  fill(120);
  text(str(bubbles_plotted)+" / "+str(balls.length), spaceleft, height-30);
  
  // titles
  textFont(font2, 18);
  textAlign(RIGHT);
  text("]", width - spaceright, height-31);
  fill(ColorAcento);
  text(lines[1], width - spaceright - textWidth("]"), height-31);
  fill(120);
  text("[", width - spaceright - textWidth(lines[1]+"]"), height-31);
  float width_parcial = textWidth("["+lines[1]+"]");
  textFont(font2, 18);
  text(lines[0]+" ", width - spaceright - width_parcial, height-31);
    
  if ( nro_linea < lines.length ) {
    barraAvance( spaceleft, height - 25, width - spaceright, height - 15, 
                nro_linea-2, lines.length-3, ColorLineasGrales, ColorAcento ); 
    barraAvance( spaceleft, height - 15, width - spaceright, height - 12, 
                nro_space, lines[nro_linea].length()-2, ColorLineasGrales, ColorAcentoCompanion );
  } else {
    barraAvance( spaceleft, height - 25, width - spaceright, height - 15, 
                10, 10, ColorLineasGrales, ColorAcento ); 
    barraAvance( spaceleft, height - 15, width - spaceright, height - 12, 
                10, 10, ColorLineasGrales, ColorAcentoCompanion );
  }
}

void sumarKP( String newKP ) {
  int kp_encontrado = 0;
  // buscar kp a sumar en array existente
  for (int i=0; i < balls.length; i++) { 
    if ( balls[i].name == newKP ) { // si encuentro el kp le sumo una ocurrencia
      kp_encontrado = 1;
      balls[i].occurrences++;
    } 
    if ( kp_encontrado == 1 ) break;
  } 
  
  // si no lo encuentro lo creo
  if ( kp_encontrado == 0 ) nuevoKP( newKP );

}

void nuevoKP( String newx ) {  
  calcularKtotal();
  float ka;
  if ( balls.length > 0 ) ka = k_total / balls.length;
  else ka = k_total;
  Ball[] tempBall = new Ball( newx, ka, newx, 1 );
  balls[balls.length] = tempBall;
}

void ordenarArrays() {
  Ball[] temp_occurrences = new Ball[balls.length];
  temp_occurrences = balls;
  
  Ball temp;
  int i, j;
      for (i = temp_occurrences.length-1; i >= 0; i--)
         for (j = 0; j < i; j++)
            if (temp_occurrences[j].occurrences < temp_occurrences[j + 1].occurrences) {
               temp = temp_occurrences[j];
               temp_occurrences[j] = temp_occurrences[j + 1];
               temp_occurrences[j + 1] = temp;
            }

  balls = temp_occurrences;
}

void calcularKtotal () {
  // encontrar un valor de k (superficie a ocupar) que concuerde con
  // la cantidad de burbujar a dibujar (evitar que se superpongan)
  
  float height = height - spaceup - spacebelow;
  float width = width - spaceleft - spaceright;
  
  if ( bubbles_plotted <= 1 ) {
    if ( height < width ) k_total = PI*pow(height/2,2)*0.8;
    else k_total = PI*pow(width/2,2)*0.8;
  }
  else if ( bubbles_plotted > 1 && bubbles_plotted <= 6 ) k_total = width * height * 0.65;
  else if ( bubbles_plotted > 6 && bubbles_plotted <= 20 ) k_total = width * height * 0.75;
  else if ( bubbles_plotted > 20 && bubbles_plotted <= 50 ) k_total = width * height * 0.80;
  else if ( bubbles_plotted > 50 && bubbles_plotted <= 200 ) k_total = width * height * 0.86;
  else if ( bubbles_plotted > 200 ) k_total = width * height * 0.92;
}

void keyPressed() {
    if(keyCode<256) keyboard.press(keyCode);

    if (key == 'a') { // viendo mas bubbles
      if ( bubbles_max == 0 ) bubbles_max = 4;
      else if ( bubbles_max == 4 ) bubbles_max = 19;
      else if ( bubbles_max == 19 ) bubbles_max = 49;
      else if ( bubbles_max == 49 ) bubbles_max = 99;
    }
    if (key == 's') { // viendo menos bubbles
      if ( bubbles_max == 99 ) bubbles_max = 49;
      else if ( bubbles_max == 49 ) bubbles_max = 19;
      else if ( bubbles_max == 19 ) bubbles_max = 4;
    }
    if (key == 'r' || key == 'R') { // activando springs
      if ( spring_activated == true ) spring_activated = false;
      else if ( spring_activated == false ) spring_activated = true;
    }
    if (key == 'i' || key == 'I') { // mostrar info en bubbles
      if ( show_info == true ) show_info = false;
      else if ( show_info == false ) show_info = true;
    }
    if (key == 'l' || key == 'L') { // mostrar bubbles opacas
      if ( fill_bubbles == true ) fill_bubbles = false;
      else if ( fill_bubbles == false ) fill_bubbles = true;
    }
    if (key == 'f' || key == 'F') { // cambiar modo de layout
      if ( layout_actual == "standard" ) layout_actual = "reducido";
      else if ( layout_actual == "reducido" ) layout_actual = "standard";
    }
    if ( keyboard.pressed(UP) || keyboard.pressed(DOWN) || keyboard.pressed(LEFT) || keyboard.pressed(RIGHT) ) { // aplicar gravedad
      no_gravity = true;
    } else no_gravity = false;
    if (key == 's') { // shaking
      for ( int i=0; i<balls.length; i++ ) {
        balls[i].x += random(-10,10);
        balls[i].y += random(-10,10);
      }
    }
    if (key == 'd' || key == 'D') { // redistribuyendo
      for ( int i=0; i<balls.length; i++ ) {
        balls[i].x = random(balls[i].r+spaceleft, width-spaceright-balls[i].r);
        balls[i].y = random(balls[i].r+spaceup, height-spacebelow-balls[i].r);
      }
    }
}

void keyReleased() { 
  if(keyCode<256) keyboard.release(keyCode);
}

void mouseReleased() { 
  dragging = -1;
}

class Ball {
  float r;
  float m;
  
  float x;
  float y;
  
  float vx;
  float vy;
  
  int id;
  float ka;
  
  String name;
  int occurrences;
  
  // Spring
  float mass;                                       // Masa
  float kspring;                                    // Constante de spring
  float damp;                                       // Damping 
  float rest_posx = ((width-spaceright) / 2) + spaceleft / 2;
  float rest_posy = ((height-spacebelow) / 2) + spaceright / 2;
  float accel = 0;                                  // Aceleracion 
  float force = 0;                                  // Fuerza
  
  boolean estamos_above;
  Ball( int ID, float KA, String NOMBRE, int OCURR ) {
    ka = KA;
    r = sqrt( ka / PI );
    m = r;
    x = random(r+spaceleft, width-spaceright-r);
    y = random(r+spaceup, height-spacebelow-r);
    vx = random(-3,3);
    vy = random(-3,3);
    id = ID;
    name = NOMBRE;
    occurrences = OCURR;
    estamos_above = false;
    
    mass = sqrt( ( ( (PI*pow((height- spacebelow - spaceup)/2,2)*0.8) / 2000 ) / PI ) );
    damp = 0.85;
    kspring = 0.01;
  }
  
  void fall() {
    if ( keyboard.pressed(UP) ) vy -= grav;
    if ( keyboard.pressed(DOWN) ) vy += grav;
    if ( keyboard.pressed(LEFT) ) vx -= grav;
    if ( keyboard.pressed(RIGHT) ) vx += grav;
  }
  
  void spring() {
    rest_posx = ( ( width-spaceright ) / 2 ) + spaceleft / 2;
    rest_posy = ( ( height-spacebelow ) / 2 ) + spaceright / 2; 

    if ( balls.length > 0 && ( balls[0].occurrences - balls[bubbles_plotted-1].occurrences ) > 0 ) {
      float A = balls[0].occurrences;                        // maximo original
      float C = occurrences;                                 // valor original
      float B = balls[bubbles_plotted-1].occurrences;    // minimo original
      float D = 5;                                           // nuevo maximo
      float E;                                               // nuevo minimo
      if ( bubbles_plotted > 20 ) E = -1;
      else E = 0;
      kspring = -1 * ( ( ( A - C ) / ( A - B ) ) * ( D - E ) - D );
    }
    if ( bubbles_plotted == 1 ) kspring = 4;
    
    //mass = r;
    
    force = -kspring * (y - rest_posy);    // f=-ky 
    accel = force / mass;                  // Asignar aceleracion
    vy = damp * (vy + accel);              // Definir velocidad 
    //y += vy;

    force = -kspring * (x - rest_posx);    // f=-ky 
    accel = force / mass;                  // Asignar aceleracion
    vx = damp * (vx + accel);              // Definir velocidad 
    //x += vx;
  }
  
  void bounce() {
  
    if ( y + vy + r > height-spacebelow ) {
    
      y = height-spacebelow - r;
      vx *= f;
      vy *= -b;
    }
    if ( y + vy - r < spaceup ) {
    
      y = r+spaceup;
      vx *= f;
      vy *= -b;
    }
    if ( x + vx + r > width-spaceright ) {
    
      x = width-spaceright - r;
      vx *= -b;
      vy *= f;
    }
    if ( x + vx - r < spaceleft ) {
    
      x = r + spaceleft;
      vx *= -b;
      vy *= f;
    }
  }
  
  void collide() {
    for ( int i=bubbles_max; i>=0; i-- ) {
      if ( i < balls.length ) {
        float X = balls[i].x;
        float Y = balls[i].y;
        float R = balls[i].r;
        float M = balls[i].m;
      
        float deltax = X-x;
        float deltay = Y-y;
        float d = sqrt(pow(deltax,2)+pow(deltay,2));
      
        if ( d < r + R && d > 0 ) {
          float dD = r + R - d;
          float theta = atan2(deltay,deltax);
        
          vx += -dD*cos(theta)*M/(m+M);
          vy += -dD*sin(theta)*M/(m+M);
        
          vx *= b;
          vy *= b;
        }
      }
    }
  }
  
  void move() {
  
    if ( estamos_above && mousePressed && ( dragging == -1 || dragging == id ) ) {
      x = mouseX;
      y = mouseY;
      vx = 0;
      vy = 0;
      dragging = id;
    } else {
      x += vx;
      y += vy;
    }
    
    
  }
  
  void above() {
  
    if ( dist(x, y, mouseX, mouseY) < r ) estamos_above = true;
    else estamos_above = false;
  
  }
  
  void display() {
  
    float A = balls[0].occurrences;                        // maximo original
    float C = occurrences;                                 // valor original
    float B = balls[bubbles_plotted-1].occurrences;    // minimo original
    float D;                                               // nuevo maximo
    float E;                                               // nuevo minimo
    //nuevo_valor = -1 * ( ( ( A - C ) / ( A - B ) ) * ( D - E ) - D );
  
    if ( visual_mode == "lineal" ) {

      if ( fill_bubbles ) fill(255,255,255);
      else noFill();
      if ( estamos_above ) fill(0,0,0,15);
      strokeWeight(r/10);
      //stroke(ColorLineasGrales);
      float lc = -1 * ( ( ( A - C ) / ( A - B ) ) * ( 60 - 200 ) - 60 );
      float lcalpha = -1 * ( ( ( A - C ) / ( A - B ) ) * ( 255 - 90 ) - 255 );
      if ( A == B ) lcalpha = 255;
      color local = color( lc );
      stroke( local );
      //noFill();
      ellipse(x,y,2*r-r/10,2*r-r/10); 
    
      float tamanio = r*0.8;
      textFont(font, tamanio);
      textAlign(CENTER);
      fill(0, 102, 153, lcalpha);
      //fill(0, 102, 153);
      //if ( show_info || estamos_above ) text(name, x, y+tamanio/5);
      if ( show_info ) text(name, x, y+tamanio/5);
      else text(name, x, y+tamanio/3);
    
      //if ( show_info || estamos_above ) {
      if ( show_info ) {
        float tamanio1 = r*0.3;
        textFont(font, tamanio1);
        fill(0, 102, 153, lcalpha);
        text(str(occurrences), x, y+tamanio/3+tamanio1);
      }
    
    }

  }
}


//
// Funcion para dibujar barra de avance
// 23/07/05 :: P&A
//

void barraAvance( int x1, int y1, 
                  int x2, int y2, 
                  float ValParcial, float ValTotal, 
                  color ColorLinea, color ColorRelleno ) {

  float AnchoReal = ( ( ( ValParcial * 100 ) / ValTotal ) * ( x2 - x1 )  ) / 100;

  strokeWeight(1);
  stroke(ColorLinea);
  noFill();
  rectMode(CORNERS); 
  rect(x1, y1, x2, y2);
  
  noStroke();
  fill(ColorRelleno);
  rect(x1, y1, x1+AnchoReal+1, y2+1);

}



Keys keyboard = new Keys();

class Keys { 

  boolean[] k; 
   
  Keys() { 
    k=new boolean[255]; 
    for(int i=0;i<k.length;i++) k[i]=false;  
  } 
 
  void press(int x) { 
    k[x]=true; 
  } 
 
  void release(int x) { 
    k[x]=false; 
  } 
 
  boolean pressed(int x) { 
    return k[x]; 
  } 
 
  void releaseAll() { 
    for(int i=0;i<k.length;i++) k[i]=false;  
  } 
 
  boolean anyPressed() { 
    for(int i=0;i<k.length;i++) if(k[i]==true) return true; 
    return false; 
  } 
}
