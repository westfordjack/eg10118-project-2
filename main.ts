//  EG10118 Section 12 Project 2 Program: Bomb Sniffing Robot
//  Nathan Burke, Edan Czarobski, Ben Muckian, Jack Whitman
let leftSpeed = 50
let rightSpeed = 50
while (true) {
    CutebotPro.pwmCruiseControl(leftSpeed, rightSpeed)
    if (CutebotPro.ultrasonic(SonarUnit.Centimeters) < 10) {
        CutebotPro.stopImmediately(CutebotProMotors.M1)
        music.play(music.tonePlayable(Note.G, music.beat(BeatFraction.Half)), music.PlaybackMode.UntilDone)
        CutebotPro.trolleySteering(CutebotProTurn.Left, 180)
    }
    
}
