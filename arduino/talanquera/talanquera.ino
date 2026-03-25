#include <Servo.h>

Servo servo;
const int LED = 13;
const int BUZZER = 8;

void setup() {
  Serial.begin(9600);
  servo.attach(9);
  pinMode(LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  servo.write(0);
}

void loop() {
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd == '1') {
      digitalWrite(LED, HIGH);
      digitalWrite(BUZZER, HIGH);
      servo.write(90);
      delay(3000);
      servo.write(0);
      digitalWrite(LED, LOW);
      digitalWrite(BUZZER, LOW);
    }
  }
}
