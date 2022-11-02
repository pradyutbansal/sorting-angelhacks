// -----------------------------------
// Controlling LEDs over the Internet
// -----------------------------------

/* First, let's create our "shorthand" for the pins
Same as in the Blink an LED example:
led1 is D7, led2 is A2, led3 is D4 */

int led1 = D7;
int led2 = A2;
int led3 = D4;



void setup()
{

 // Here's the pin configuration, same as last time
 // pinMode(led1, OUTPUT);
 pinMode(led1, OUTPUT);
 pinMode(led2, OUTPUT);
 pinMode(led3, OUTPUT);


 // We are also going to declare a Particle.function so that we can turn the LED on and off from the cloud.
 Particle.function("led",ledToggle);
 // This is saying that when we ask the cloud for the function "led", it will employ the function ledToggle() from this app.

 // For good measure, let's also make sure both LEDs are off when we start:
 // digitalWrite(led1, LOW);
 digitalWrite(led1, LOW);
 digitalWrite(led2, LOW);
 digitalWrite(led3, LOW);

}


/* Last time, we wanted to continously blink the LED on and off
Since we're waiting for input through the cloud this time,
we don't actually need to put anything in the loop */

void loop()
{
 // Nothing to do here
}

// We're going to have a super cool function now that gets called when a matching API request is sent
// This is the ledToggle function we registered to the "led" Particle.function earlier.

int ledToggle(String command) {
  /* Particle.functions always take a string as an argument and return an integer.
  Since we can pass a string, it means that we can give the program commands on how the function should be used.
  In this case, telling the function "on" will turn the LED on and telling it "off" will turn the LED off.
  Then, the function returns a value to us to let us know what happened.
  In this case, it will return 1 for the LEDs turning on, 0 for the LEDs turning off,
  and -1 if we received a totally bogus command that didn't do anything to the LEDs.
  */
  if (command=="trash" || command=="Trash" || command=="TRASH") {
      digitalWrite(led1,HIGH);
      delay(2000);
      digitalWrite(led1,LOW);
      return 1;
  }
  else if (command=="recycle" || command=="Recycle" || command=="RECYCLE") {
      digitalWrite(led2,HIGH);
      delay(2000);
      digitalWrite(led2,LOW);
      return 1;
  }
  else if (command=="compost" || command=="Compost" || command=="COMPOST") {
    digitalWrite(led3,HIGH);
    delay(2000);
    digitalWrite(led3,LOW);
      return 1;
  }

  else {
      return -1;
  }
}