import * as THREE from 'three';

export type CameraName = 'office' | 'stage' | 'leftHall' | 'rightHall' | 'back';

export interface GameUiState {
  cameraName: string;
  timeString: string;
  powerPercent: number;
}

interface GameOptions {
  mountElement: HTMLElement;
  onUiUpdate: (ui: GameUiState) => void;
  onGameMessage: (msg: string) => void;
  onClearMessage: () => void;
}

interface NodeDef {
  name: string;
  position: THREE.Vector3;
  neighbors: string[];
}

class Animatronic {
  public readonly name: string;
  public readonly mesh: THREE.Mesh;
  private currentNodeName: string;
  private targetNodeName: string | null = null;
  private targetPosition: THREE.Vector3 | null = null;
  private timeUntilNextDecision: number = 0;
  private readonly speedMetersPerSecond: number;
  private aggression: number; // higher = moves more often

  constructor(params: { name: string; startNode: string; color: number; speed: number; aggression: number; }) {
    this.name = params.name;
    this.currentNodeName = params.startNode;
    this.speedMetersPerSecond = params.speed;
    this.aggression = params.aggression;

    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshStandardMaterial({ color: params.color, metalness: 0.2, roughness: 0.8 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;
  }

  public placeAt(position: THREE.Vector3): void {
    this.mesh.position.copy(position);
  }

  public setAggression(value: number): void {
    this.aggression = value;
  }

  public getCurrentNode(): string { return this.currentNodeName; }

  public update(
    dtSeconds: number,
    graph: Map<string, NodeDef>,
    canEnterOffice: (doorSide: 'left' | 'right') => boolean,
    officeNodeName: string
  ): { reachedOffice: boolean } {
    if (this.timeUntilNextDecision > 0) {
      this.timeUntilNextDecision -= dtSeconds;
    }

    // Move towards target position if any
    if (this.targetPosition) {
      const distanceRemaining = this.mesh.position.distanceTo(this.targetPosition);
      const travelDistance = this.speedMetersPerSecond * dtSeconds;
      if (travelDistance >= distanceRemaining) {
        this.mesh.position.copy(this.targetPosition);
        this.currentNodeName = this.targetNodeName || this.currentNodeName;
        this.targetNodeName = null;
        this.targetPosition = null;
        // After arriving, small pause before next decision
        this.timeUntilNextDecision = 0.3 + Math.random() * 0.6;
      } else {
        const direction = new THREE.Vector3().subVectors(this.targetPosition, this.mesh.position).normalize();
        this.mesh.position.addScaledVector(direction, travelDistance);
        this.mesh.lookAt(this.targetPosition.x, this.mesh.position.y, this.targetPosition.z);
      }
    }

    // Decide next move when idle and decision timer elapsed
    if (!this.targetPosition && this.timeUntilNextDecision <= 0) {
      const currentNode = graph.get(this.currentNodeName);
      if (!currentNode) return { reachedOffice: false };

      const candidateNeighbors = [...currentNode.neighbors];

      // Gate entering office by door state depending on side
      const filteredNeighbors = candidateNeighbors.filter((n) => {
        if (n === officeNodeName) {
          if (this.currentNodeName === 'leftDoor') return canEnterOffice('left');
          if (this.currentNodeName === 'rightDoor') return canEnterOffice('right');
        }
        return true;
      });

      if (filteredNeighbors.length === 0) {
        // Wait longer if blocked by doors
        this.timeUntilNextDecision = 1.0 + Math.random() * 1.5;
      } else {
        // Slight bias to move forward toward doors/office
        filteredNeighbors.sort((a, b) => this.biasForNode(a) - this.biasForNode(b));
        const chooseForward = Math.random() < 0.65 + Math.min(0.25, this.aggression * 0.05);
        const chosen = chooseForward ? filteredNeighbors[0] : filteredNeighbors[Math.floor(Math.random() * filteredNeighbors.length)];
        this.setTarget(chosen, graph);
        // Decision cooldown inversely proportional to aggression
        const base = 2.5;
        const variance = 1.5;
        const speedup = THREE.MathUtils.clamp(this.aggression * 0.12, 0, 1.5);
        this.timeUntilNextDecision = Math.max(0.2, base + (Math.random() - 0.5) * variance - speedup);
      }
    }

    return { reachedOffice: this.currentNodeName === officeNodeName };
  }

  private setTarget(nextNodeName: string, graph: Map<string, NodeDef>): void {
    const node = graph.get(nextNodeName);
    if (!node) return;
    this.targetNodeName = nextNodeName;
    this.targetPosition = node.position.clone();
  }

  private biasForNode(nodeName: string): number {
    // Lower score means more preferred
    switch (nodeName) {
      case 'leftHall':
      case 'rightHall':
        return 1;
      case 'leftDoor':
      case 'rightDoor':
        return 0.5;
      case 'office':
        return 0;
      default:
        return 2;
    }
  }
}

export class Game {
  private readonly options: GameOptions;
  private readonly scene: THREE.Scene;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly cameras: Map<CameraName, THREE.PerspectiveCamera> = new Map();
  private activeCameraName: CameraName = 'office';
  private readonly clock: THREE.Clock;

  private disposed = false;
  private running = false;
  private ended = false;

  private powerPercent = 100;
  private leftDoorClosed = false;
  private rightDoorClosed = false;
  private powerOutage = false;

  private readonly doorMeshes: { left: THREE.Mesh; right: THREE.Mesh };
  private readonly doorTargetsY: { left: number; right: number } = { left: 4.2, right: 4.2 };

  private readonly floor: THREE.Mesh;
  private readonly graph: Map<string, NodeDef>;
  private readonly officeNodeName: string = 'office';

  private animatronics: Animatronic[] = [];

  private elapsedNightSeconds = 0;
  private readonly nightDurationSeconds = 180; // 3 minutes to reach 6 AM

  constructor(options: GameOptions) {
    this.options = options;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050505);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    options.mountElement.innerHTML = '';
    options.mountElement.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(10, 20, 10);
    this.scene.add(dir);

    // World geometry
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x202020, metalness: 0.1, roughness: 0.9 });
    this.floor = new THREE.Mesh(floorGeo, floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = 0;
    this.scene.add(this.floor);

    // Simple walls and hall hints
    this.addHallWalls();

    // Door meshes
    const doorGeo = new THREE.BoxGeometry(2.2, 3.2, 0.2);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x333366, metalness: 0.3, roughness: 0.6, emissive: new THREE.Color(0x000022), emissiveIntensity: 0.1 });
    const leftDoor = new THREE.Mesh(doorGeo, doorMat);
    const rightDoor = new THREE.Mesh(doorGeo, doorMat);
    leftDoor.position.set(-4, 4.2, 0);
    rightDoor.position.set(4, 4.2, 0);
    this.scene.add(leftDoor, rightDoor);
    this.doorMeshes = { left: leftDoor, right: rightDoor };

    // Cameras
    this.initCameras();

    // Node graph
    this.graph = this.buildGraph();

    // Animatronics
    this.initAnimatronics();

    // Events
    window.addEventListener('resize', this.onResize);

    // Initial UI
    this.pushUi();
  }

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.ended = false;
    this.powerOutage = false;
    this.clock.start();
    this.loop();
  }

  public reset(): void {
    // Dispose meshes and reinitialize
    this.running = false;
    this.ended = false;
    this.powerOutage = false;
    this.powerPercent = 100;
    this.leftDoorClosed = false;
    this.rightDoorClosed = false;
    this.doorTargetsY.left = 4.2;
    this.doorTargetsY.right = 4.2;
    this.scene.background = new THREE.Color(0x050505);

    for (const anim of this.animatronics) {
      this.scene.remove(anim.mesh);
    }
    this.animatronics = [];
    this.elapsedNightSeconds = 0;

    this.initAnimatronics();
    this.options.onClearMessage();
    this.setCamera('office');
    this.pushUi();
    this.start();
  }

  public isEnded(): boolean { return this.ended; }

  public setCamera(name: CameraName): void {
    if (this.activeCameraName === name) return;
    const cam = this.cameras.get(name);
    if (!cam) return;
    this.activeCameraName = name;
    this.pushUi();
  }

  public toggleLeftDoor(): void {
    if (this.ended || this.powerOutage) return;
    this.leftDoorClosed = !this.leftDoorClosed;
    this.doorTargetsY.left = this.leftDoorClosed ? 1.6 : 4.2;
  }

  public toggleRightDoor(): void {
    if (this.ended || this.powerOutage) return;
    this.rightDoorClosed = !this.rightDoorClosed;
    this.doorTargetsY.right = this.rightDoorClosed ? 1.6 : 4.2;
  }

  private loop = (): void => {
    if (!this.running || this.disposed) return;
    const dt = Math.min(0.05, this.clock.getDelta());

    if (!this.ended) {
      this.updateGame(dt);
    }

    const camera = this.cameras.get(this.activeCameraName)!;
    this.renderer.render(this.scene, camera);

    requestAnimationFrame(this.loop);
  };

  private updateGame(dt: number): void {
    // Update time and check win
    this.elapsedNightSeconds += dt;
    if (this.elapsedNightSeconds >= this.nightDurationSeconds) {
      this.elapsedNightSeconds = this.nightDurationSeconds;
      this.win();
      return;
    }

    // Update power
    this.updatePower(dt);

    // Doors animation
    this.updateDoors(dt);

    // Animatronics
    const reached = this.updateAnimatronics(dt);
    if (reached) {
      this.lose();
      return;
    }

    // UI
    this.pushUi();
  }

  private updatePower(dt: number): void {
    if (this.ended) return;
    let drainPerSecond = 0.05; // base
    if (this.activeCameraName !== 'office') drainPerSecond += 0.25; // CCTV usage
    if (this.leftDoorClosed) drainPerSecond += 0.25;
    if (this.rightDoorClosed) drainPerSecond += 0.25;

    this.powerPercent -= drainPerSecond * dt;
    if (this.powerPercent <= 0) {
      this.powerPercent = 0;
      if (!this.powerOutage) this.onPowerOutage();
    }
  }

  private onPowerOutage(): void {
    this.powerOutage = true;
    this.leftDoorClosed = false;
    this.rightDoorClosed = false;
    this.doorTargetsY.left = 4.2;
    this.doorTargetsY.right = 4.2;
    this.options.onGameMessage('Power out! Doors disabled...');
    // Slightly darken scene
    this.scene.background = new THREE.Color(0x000000);
  }

  private updateDoors(dt: number): void {
    const speed = 5.0; // units per second
    // Left
    const currentLeftY = this.doorMeshes.left.position.y;
    const targetLeftY = this.doorTargetsY.left;
    const deltaLeft = THREE.MathUtils.clamp((targetLeftY - currentLeftY), -speed * dt, speed * dt);
    this.doorMeshes.left.position.y = currentLeftY + deltaLeft;
    // Right
    const currentRightY = this.doorMeshes.right.position.y;
    const targetRightY = this.doorTargetsY.right;
    const deltaRight = THREE.MathUtils.clamp((targetRightY - currentRightY), -speed * dt, speed * dt);
    this.doorMeshes.right.position.y = currentRightY + deltaRight;
  }

  private updateAnimatronics(dt: number): boolean {
    // Increase aggression as time progresses
    const progress = this.elapsedNightSeconds / this.nightDurationSeconds; // 0..1
    const aggressionLevel = 3 + progress * 7; // 3..10

    let anyAtOffice = false;
    for (const anim of this.animatronics) {
      anim.setAggression(aggressionLevel);
      const result = anim.update(
        dt,
        this.graph,
        (side) => side === 'left' ? !this.leftDoorClosed : !this.rightDoorClosed,
        this.officeNodeName
      );
      if (result.reachedOffice) {
        anyAtOffice = true;
      }
    }
    return anyAtOffice;
  }

  private pushUi(): void {
    const timeString = this.computeTimeString();
    this.options.onUiUpdate({
      cameraName: this.activeCameraName.toUpperCase(),
      timeString,
      powerPercent: this.powerPercent
    });
  }

  private computeTimeString(): string {
    const hoursPassed = Math.floor((this.elapsedNightSeconds / this.nightDurationSeconds) * 6);
    if (hoursPassed <= 0) return '12 AM';
    if (hoursPassed < 6) return `${hoursPassed} AM`;
    return '6 AM';
  }

  private win(): void {
    this.ended = true;
    this.options.onGameMessage('6 AM! You survived. Press R to restart');
  }

  private lose(): void {
    this.ended = true;
    this.options.onGameMessage('Caught by an animatronic! Press R to restart');
  }

  private initCameras(): void {
    const makeCam = (): THREE.PerspectiveCamera => {
      const cam = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
      return cam;
    };

    const officeCam = makeCam();
    officeCam.position.set(0, 1.6, -6);
    officeCam.lookAt(0, 1.4, 2);

    const stageCam = makeCam();
    stageCam.position.set(0, 2.0, 24);
    stageCam.lookAt(0, 1.6, 16);

    const leftHallCam = makeCam();
    leftHallCam.position.set(-6, 1.7, 6);
    leftHallCam.lookAt(-4, 1.4, 1);

    const rightHallCam = makeCam();
    rightHallCam.position.set(6, 1.7, 6);
    rightHallCam.lookAt(4, 1.4, 1);

    const backCam = makeCam();
    backCam.position.set(0, 2.0, 16);
    backCam.lookAt(0, 1.6, 20);

    this.cameras.set('office', officeCam);
    this.cameras.set('stage', stageCam);
    this.cameras.set('leftHall', leftHallCam);
    this.cameras.set('rightHall', rightHallCam);
    this.cameras.set('back', backCam);
  }

  private addHallWalls(): void {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x303030, metalness: 0.1, roughness: 0.9 });
    const wallGeo = new THREE.BoxGeometry(0.5, 3, 10);

    const leftHallLeft = new THREE.Mesh(wallGeo, wallMat);
    leftHallLeft.position.set(-7, 1.5, 5);
    const leftHallRight = new THREE.Mesh(wallGeo, wallMat);
    leftHallRight.position.set(-3, 1.5, 5);

    const rightHallLeft = new THREE.Mesh(wallGeo, wallMat);
    rightHallLeft.position.set(3, 1.5, 5);
    const rightHallRight = new THREE.Mesh(wallGeo, wallMat);
    rightHallRight.position.set(7, 1.5, 5);

    const officeBackWallGeo = new THREE.BoxGeometry(10, 3, 0.5);
    const officeBackWall = new THREE.Mesh(officeBackWallGeo, wallMat);
    officeBackWall.position.set(0, 1.5, -8);

    // Stage backdrop
    const stageWall = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 0.5), wallMat);
    stageWall.position.set(0, 1.5, 22);

    // Door frames
    const frameGeo = new THREE.BoxGeometry(0.5, 3.2, 1.5);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.2, roughness: 0.8 });
    const leftFrame = new THREE.Mesh(frameGeo, frameMat);
    leftFrame.position.set(-5, 1.6, 0);
    const rightFrame = new THREE.Mesh(frameGeo, frameMat);
    rightFrame.position.set(5, 1.6, 0);

    this.scene.add(leftHallLeft, leftHallRight, rightHallLeft, rightHallRight, officeBackWall, stageWall, leftFrame, rightFrame);

    // Stage platform
    const stagePlat = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 3), new THREE.MeshStandardMaterial({ color: 0x252525 }));
    stagePlat.position.set(0, 0.25, 20);
    this.scene.add(stagePlat);

    // Office desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 1.2), new THREE.MeshStandardMaterial({ color: 0x2a2a2a }));
    desk.position.set(0, 0.5, -6);
    this.scene.add(desk);

    // Ceiling lights hints
    const lightMat = new THREE.MeshStandardMaterial({ color: 0x666666, emissive: 0x111111, emissiveIntensity: 0.7 });
    const lightGeo = new THREE.BoxGeometry(0.8, 0.2, 0.8);
    const light1 = new THREE.Mesh(lightGeo, lightMat); light1.position.set(-5, 2.8, 2);
    const light2 = new THREE.Mesh(lightGeo, lightMat); light2.position.set(5, 2.8, 2);
    const light3 = new THREE.Mesh(lightGeo, lightMat); light3.position.set(0, 2.8, 18);
    this.scene.add(light1, light2, light3);
  }

  private buildGraph(): Map<string, NodeDef> {
    const defs: NodeDef[] = [
      { name: 'stage', position: new THREE.Vector3(0, 1, 20), neighbors: ['leftHall', 'rightHall', 'back'] },
      { name: 'leftHall', position: new THREE.Vector3(-6, 1, 10), neighbors: ['stage', 'leftDoor'] },
      { name: 'rightHall', position: new THREE.Vector3(6, 1, 10), neighbors: ['stage', 'rightDoor'] },
      { name: 'leftDoor', position: new THREE.Vector3(-4, 1, 0), neighbors: ['leftHall', 'office'] },
      { name: 'rightDoor', position: new THREE.Vector3(4, 1, 0), neighbors: ['rightHall', 'office'] },
      { name: 'office', position: new THREE.Vector3(0, 1, -2), neighbors: [] },
      { name: 'back', position: new THREE.Vector3(0, 1, 14), neighbors: ['stage'] },
    ];
    const map = new Map<string, NodeDef>();
    for (const d of defs) map.set(d.name, d);
    return map;
  }

  private initAnimatronics(): void {
    const spawnPositions = {
      stage: this.graph.get('stage')!.position,
      back: this.graph.get('back')!.position
    };

    const bot1 = new Animatronic({ name: 'Bot1', startNode: 'stage', color: 0xff4444, speed: 1.0, aggression: 3 });
    const bot2 = new Animatronic({ name: 'Bot2', startNode: 'stage', color: 0x44ff44, speed: 0.9, aggression: 3 });
    const bot3 = new Animatronic({ name: 'Bot3', startNode: 'back',  color: 0x4488ff, speed: 0.95, aggression: 3 });

    bot1.placeAt(spawnPositions.stage.clone().add(new THREE.Vector3(-1.2, 0, 0)));
    bot2.placeAt(spawnPositions.stage.clone().add(new THREE.Vector3(1.2, 0, 0)));
    bot3.placeAt(spawnPositions.back.clone());

    this.animatronics.push(bot1, bot2, bot3);
    for (const a of this.animatronics) this.scene.add(a.mesh);
  }

  private onResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    for (const cam of this.cameras.values()) {
      cam.aspect = width / height;
      cam.updateProjectionMatrix();
    }
    this.renderer.setSize(width, height);
  };
}