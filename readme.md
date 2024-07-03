#### Orinithography (Flocking)

##### Abstract

A flock of birds is beautiful as well as complex. Complex emergent behaviors often arise from simple interactions among a large number of units. Boid's Algorithm, with three simple interaction rules, allows us to mimic such emergent behaviors in a flock of birds. In this world, each bird (or Boid) has a finite perception radius, and they (1) align toward their average local velocity, (2) steer toward the local center of mass, and (3) steer away to avoid crowding.

We also imposed an additional rule in this world: the angular velocity of a bird's wing is proportional to its speed. Drawing trails of the wings allows us to create pictures similar to the Ornithography by Xavi Bou.

Other rules, such as avoiding obstacles, can also be imposed. In the visualization, using a webcam and an object detection algorithm, we map the real-time positions of detected humans as obstacles in the 2D world of these birds, which they actively avoid.


To Dos:
- Add the ability to change different parameters relavant to the simulation and visualization
- Change the background depending of differnt time of the day.
- Add an option to add force field in the world which will act like wild flow.
- Add tree in the world to which the birds are attracted or repealed.
- Chaotic trajectories?
- Make the human obstacle human like, not circular. Add a silhouette instead of a circle




