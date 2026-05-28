// Spec field definitions keyed by lowercase subcategory name.
// Each field: { key, label, type: 'text'|'select', options?, placeholder? }

const t = (key, label, placeholder = '') => ({ key, label, type: 'text', placeholder });
const s = (key, label, options) => ({ key, label, type: 'select', options });

// ── Shared field definitions ───────────────────────────────────────────────
const WIFI   = t('wifi',   'Wi-Fi Standard',     'e.g. 802.11ac Dual Band');
const SPEED  = t('speed',  'Max Speed',           'e.g. 1200 Mbps');
const PORTS  = t('ports',  'Ports',               'e.g. 4× Gigabit LAN, 1× WAN');
const FREQ   = t('frequency', 'Frequency',        'e.g. 5 GHz');
const GAIN   = t('gain',   'Gain',                'e.g. 20 dBi');
const RANGE  = t('range',  'Range',               'e.g. Up to 10 km');
const FEAT   = t('features', 'Features',          'e.g. PoE support, VLAN');
const THRU   = t('throughput', 'Throughput',      'e.g. 1 Gbps');
const OS     = t('OS',     'OS / Firmware',       'e.g. RouterOS v7');
const MGMT   = t('management', 'Management',      'e.g. UniFi Controller');
const POE    = t('PoE',    'PoE Standard',        'e.g. 802.3af PoE');
const ANT    = t('antenna',  'Antenna',           'e.g. 19 dBi integrated');
const ANTS   = t('antennas', 'Antennas',          'e.g. 4 external 5dBi');
const BEAMW  = t('beamwidth', 'Beamwidth',        'e.g. 90°');
const COMPAT = t('compatibility', 'Compatibility','e.g. Rocket M5/5AC');
const MOUNT  = s('mounting', 'Mounting', [
  'Desktop', 'Desktop/Wall', 'Desktop or wall-mount',
  'Ceiling', 'Ceiling or wall', 'Wall', 'Pole-mount', 'Rack-mount',
]);
const BANDS  = s('bands', 'Bands', ['Single-band', 'Dual-band', 'Tri-band']);
const IFACE  = s('interface', 'Interface', ['USB 2.0', 'USB 3.0', 'USB-C', 'PCIe']);
const POLAR  = s('polarization', 'Polarization', ['Single', 'Dual', 'Dual (H/V)']);
const FTYPE  = s('fiberType', 'Fiber Type', ['Singlemode', 'Multimode', 'Singlemode or Multimode']);
const INOUT  = s('indoorOutdoor', 'Indoor / Outdoor', ['Indoor', 'Outdoor', 'Indoor/Outdoor']);

// ── Schema map ────────────────────────────────────────────────────────────
export const SPEC_SCHEMAS = {

  // Routers
  'routers': [
    WIFI, BANDS, SPEED, PORTS, ANTS,
    t('CPU', 'CPU', 'e.g. 716 MHz'),
    t('RAM', 'RAM', 'e.g. 128 MB'),
    OS,
  ],
  'ethernet routers': [
    OS,
    t('CPU', 'CPU', 'e.g. ARM 64bit 1.7GHz 4 core'),
    PORTS, THRU,
  ],
  'wireless for home and office': [
    t('CPU', 'CPU', 'e.g. 716 MHz'),
    t('RAM', 'RAM', 'e.g. 128 MB'),
    WIFI, SPEED,
  ],

  // Switches
  'switches': [
    PORTS,
    t('switchingCapacity', 'Switching Capacity', 'e.g. 64 Gbps'),
    t('PoEBudget',         'PoE Budget',          'e.g. 60 W total'),
    t('standards',         'Standards',           'e.g. 802.3af/at'),
    FEAT, MOUNT, MGMT, OS, THRU,
    t('case', 'Case', 'e.g. Plastic'),
  ],

  // Access Points
  'access points': [
    WIFI, SPEED, ANT, POE, FEAT, MOUNT, INOUT,
    RANGE, GAIN, FREQ,
    t('modes',      'Modes',      'e.g. Router/AP/Repeater'),
    t('enclosure',  'Enclosure',  'e.g. Weatherproof'),
    t('power',      'Power',      'e.g. PoE 24V Passive'),
    t('dimensions', 'Dimensions', 'e.g. Compact design'),
  ],

  // UniFi / Wi-Fi (Ubiquiti-specific)
  'wi-fi': [
    WIFI, SPEED, POE, INOUT,
    t('controller', 'Controller', 'e.g. UniFi Controller'),
  ],
  'unifi': [
    WIFI,
    t('LANPorts',   'LAN Ports', 'e.g. 4× Gigabit'),
    t('security',   'Security',  'e.g. Built-in firewall/VPN'),
    t('controller', 'Controller','e.g. UniFi OS Console'),
    POE, SPEED, INOUT,
  ],

  // PTP / PTMP / Wireless bridges
  'ptp': [
    FREQ, THRU, ANT, RANGE, FEAT,
    t('weather', 'Weather Rating', 'e.g. Outdoor rated'),
  ],
  'ptmp': [
    FREQ, ANT, FEAT,
    t('clientCapacity', 'Client Capacity', 'e.g. 100+ clients'),
    THRU,
  ],
  'wireless systems': [
    OS, WIFI, RANGE, ANT,
  ],
  '60 ghz products': [
    FREQ,
    t('speed', 'Speed',       '1 Gbps full duplex'),
    RANGE,
    t('setup', 'Setup',       'e.g. Pre-paired out of box'),
  ],
  '60 ghz wireless': [
    FREQ,
    t('maxSpeed', 'Max Speed', 'e.g. 1 Gbps+'),
    RANGE,
    t('weather',  'Weather Rating', 'e.g. Outdoor rated'),
  ],
  'airmax devices': [
    FREQ, ANT,
    t('thruput',    'Throughput',  'e.g. Up to 450+ Mbps'),
    MGMT,
  ],

  // Antennas
  'antennas': [
    GAIN, FREQ, POLAR,
    t('mounts', 'Compatible Mounts', 'e.g. Compatible with MikroTik radios'),
  ],
  'airmax antennas': [
    GAIN, FREQ, BEAMW, COMPAT,
  ],
  '5 ghz': [
    GAIN, FREQ, BEAMW, POLAR,
    t('mount', 'Mount', 'e.g. Pole-mount'),
  ],
  '6 ghz': [
    GAIN, FREQ,
    t('diameter', 'Diameter', 'e.g. 0.6 m'),
    t('mount',    'Mount',    'e.g. Pole-mount'),
  ],
  '11 ghz': [
    GAIN, FREQ,
    t('diameter', 'Diameter', 'e.g. 2 feet'),
    POLAR,
    t('mount',    'Mount',    'e.g. Pole-mount'),
  ],

  // Fiber / Cables
  'cables': [
    t('type',       'Cable Type',     'e.g. Cat6 UTP or Duplex SMF'),
    t('length',     'Length',         'e.g. 5 m'),
    t('cableDia',   'Cable Diameter', 'e.g. 3.0 mm'),
    t('connectors', 'Connectors',     'e.g. SC/UPC to LC/UPC'),
    t('color',      'Color',          'e.g. Blue'),
  ],
  'connectors': [
    t('connectorType', 'Connector Type', 'e.g. SC/UPC'),
    FTYPE,
    t('body',  'Body',  'e.g. Ceramic sleeve'),
    t('color', 'Color', 'e.g. Blue'),
  ],
  'tools': [
    t('use',        'Use',            'e.g. Fiber cable prep'),
    t('length',     'Length',         'e.g. 105 mm'),
    t('material',   'Material',       'e.g. High carbon steel'),
    t('compatible', 'Compatible With','e.g. 125µm fiber'),
  ],

  // Adapters / Range Extenders
  'adapters': [
    IFACE, SPEED, WIFI, ANT, FEAT,
    COMPAT,
  ],
  'range extender': [
    WIFI, SPEED, ANTS,
    t('setup', 'Setup', 'e.g. WPS button'),
  ],
};
