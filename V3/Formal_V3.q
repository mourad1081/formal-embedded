//This file was generated from (Academic) UPPAAL 4.1.4 (rev. 5535), March 2014

/*
Deadlock avoidance property : il n'y a jamais de deadlock
Cette propriete DOIT etre verifie 
*/
A[] not deadlock

/*
Reachability property : il est possible qu'une voiture rapide en attente sur terre ait feu vert (high traffic light) pour decoller alors que son capteur associ\u00e9 indique qu'elle ne devrait pas
Cette propriete NE DOIT PAS etre verifie
*/
E<> high.Green and traffic_gr[2] > 0 and free[2] == 0

/*
Reachability proprety : il est possible qu'une voiture normal en attente sur terre ait feu vert (normal traffic light) pour decoller alors que son capteur associ\u00e9 indique qu'elle ne devrait pas
Cette propriete NE DOIT PAS etre verifie
*/
E<> normal.Green and traffic_gr[1] > 0 and free[1] == 0

/*
Reachability proprety : il est possible qu'une voiture lente en attente sur terre ait feu vert (slow traffic light) pour decoller alors que son capteur associ\u00e9 indique qu'elle ne devrait pas
Cette propriete NE DOIT PAS etre verifie
*/
E<> slow.Green and traffic_gr[0] > 0 and free[0] == 0

/*
Individual Liveness property : si une voiture rapide est en attentes sur terre, alors elle aura feu vert pour d\u00e9coller dans le futur
Cette propriete DOIT etre verifie
*/
traffic_gr[2] >= 1 --> high.Green

/*
Individual Liveness property : si une voiture normal est en attente sur terre, alors elle aura feu vert pour d\u00e9coller dans le futur
Cette propriete DOIT etre verifie
*/
traffic_gr[1] >= 1 --> normal.Green

/*
Individual Liveness property : si une voiture lente est en attente sur terre, alors elle aura feu vert pour d\u00e9coller dans le futur
Cette propriete DOIT etre verifie
*/
traffic_gr[0] >= 1 --> slow.Green

/*
Liveness property : si une voiture ou plus de chaque type sont en attentes sur terre, alors au moins une d'entres elles (tout type confondue) aura feu vert pour d\u00e9coller dans le futur
Cette propriete DOIT etre verifie
*/
traffic_gr[0] >= 1 and traffic_gr[1] >= 1 and traffic_gr[2] >= 1 --> slow.Green or normal.Green or high.Green

/*
Il existe une execution o\u00f9 tous les feux passeront vert (peu importe l'ordre).
La propri\u00e9t\u00e9 DOIT \u00eatre satisfaite.
*/
E<> Observer.Good

/*
Il ne peut jamais y avoir deux feux allum\u00e9s en m\u00eame temps. 
La propri\u00e9t\u00e9 DOIT \u00eatre satisfaite.
*/
A[] not((slow.Green and normal.Green) or (normal.Green and high.Green) or (slow.Green and high.Green))

/*
Au moins un des feux verts ne peut pas \u00eatre vert plus de 15 unit\u00e9 de temps. 
Comme on exprime la n\u00e9gation de cette propri\u00e9t\u00e9, celle-ci NE DOIT PAS \u00eatre satisfaite.
*/
E<> (slow.Green and slow.timer > 15) or (normal.Green and normal.timer > 15) or (high.Green and high.timer > 15)

/*
End\u00e9ans les 80 unit\u00e9s de temps, un des feux sera toujours \u00e0 vert.
*/
A[] (not(x > 80) or (slow.Green or normal.Green or high.Green))
