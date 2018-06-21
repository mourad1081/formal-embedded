//This file was generated from (Academic) UPPAAL 4.1.4 (rev. 5535), March 2014

/*
Deadlock avoidance property : il n'y a jamais de deadlock
Cette proprie9te DOIT etre verifie
*/
A[] not deadlock

/*
Liveness property : si une voiture ou plus de chaque type sont en attentes sur terre, alors au moins une d'entres elles (tout type confondue) aura feu vert pour d\u00e9coller dans le futur
Cette propriete DOIT etre verifie
*/
traffic_gr[0] >= 1 and traffic_gr[1] >= 1 and traffic_gr[2] >= 1 --> slow.Green or normal.Green or high.Green
