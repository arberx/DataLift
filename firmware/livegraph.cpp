#include <Adafruit_LIS3DH.h>
#include <LIS3DH.h>
#include "Particle.h"

SYSTEM_THREAD(ENABLED);

// How often to send samples in milliseconds
const unsigned long SEND_PERIOD_MS = 20;

const unsigned long PRINT_SAMPLE_PERIOD = 200;

LIS3DHSPI accel(SPI, A2, WKP);


const int INPUT_PIN = A2;
bool button_press = false;
const int INPUT_PIN1 = D0;


IPAddress serverAddress(138,197,27,109);
int serverPort = 8081;

// Finite state machine states
enum {CONNECT_STATE, SEND_DATA_STATE};

TCPClient client;
unsigned long lastSend = 0;
int state = CONNECT_STATE;

void setup() {
    pinMode(INPUT_PIN1, INPUT_PULLUP);

	Serial.begin(9600);
    LIS3DHConfig config;
    config.setAccelMode(LIS3DH::RATE_100_HZ);
    bool setupSuccess = accel.setup(config);
    Serial.printlnf("setupSuccess=%d", setupSuccess);

}

void loop() {
    int button = digitalRead(INPUT_PIN1);
    // if(button == HIGH && buttonpress == true){
    //     buttonpress = false;
    // }
    if(button == LOW){
        button_press = true;
    }

    if(button_press){
	switch(state) {
	case CONNECT_STATE:
		Serial.println("connecting...");
		if (client.connect(serverAddress, serverPort)) {
			state = SEND_DATA_STATE;
		}
		else {
			Serial.println("connection failed");
			delay(15000);
		}
		break;

	case SEND_DATA_STATE:
		if (client.connected()) {
			// Discard any incoming data; there shouldn't be any
			while(client.available()) {
				client.read();
			}

			// Send data up to the server
			if (millis() - lastSend >= SEND_PERIOD_MS) {
				lastSend = millis();

				// analogRead returns 0 - 4095; remove the low bits so we got 0 - 255 instead.
				// int val = analogRead(INPUT_PIN) >> 4;
				LIS3DHSample sample;
				accel.getSample(sample);
				int val = sample.z >> 4;

				Serial.println(val);

				client.write(val);
			}
		}
		else {
			// Disconnected
			Serial.println("disconnected...");
			client.stop();
			state = CONNECT_STATE;
			delay(5000);
		}
		break;
	}

}
}