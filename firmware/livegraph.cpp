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

 int counter = 0;
 int prevData = 0;


IPAddress serverAddress(138,197,27,109);
int serverPort = 8081;

// Finite state machine states
enum {CONNECT_STATE, SEND_DATA_STATE};

 int frame[200];
 int  var = 0;
 float average = 1000;

int globSize = 200;
    
TCPClient client;
unsigned long lastSend = 0;
int state = CONNECT_STATE;




float frame_average(float num){
    int val = frame[var % globSize];
    average -= val/globSize;
    frame[var % globSize] = num;
    average += num/globSize;
    ++var;
    return average;
}

float ave(float num)
{
    static float fAve = 0.0f;
    static unsigned int fSmp = 0;
    float weight = 0.0f;

     
    fSmp++;
    weight = 1.0f / fSmp;
    fAve = (weight * num) + ((1 - weight) * fAve);
    if(digitalRead(INPUT_PIN1) == LOW && fSmp >10){
        fSmp = 0;
        fAve = 0.0f;
    }
    
				if(counter > 17){
				    counter =0;
				    fSmp = 0;
                    fAve = 0.0f;
				}
    return(fAve);
}

void setup() {
    pinMode(INPUT_PIN1, INPUT_PULLUP);
    
	Serial.begin(9600);
    LIS3DHConfig config;
    config.setAccelMode(LIS3DH::RATE_100_HZ);
    bool setupSuccess = accel.setup(config);
    Serial.printlnf("setupSuccess=%d", setupSuccess);
    for(int q=0; q<globSize; ++q){
    frame[q]  = -1;
    }
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
				sample.z = frame_average(sample.z);
				int val = sample.z >> 4;
				// if(sample.z !=0 && prevData < (val - 3)){
				//     ++counter;
				// }
				if(digitalRead(INPUT_PIN1) == LOW){
				    average = 1000;
				}
			
			//	prevData = val;
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




