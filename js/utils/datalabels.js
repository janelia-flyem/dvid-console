/**
 * Describes what information to display for dvid-lite
 * datatype labels
 */

exports.datatype_labels = {
  uint8blk: [
    'array',
    '8bit'
  ],
  uint16blk: [
    'array',
    '16bit'
  ],  
  uint32blk: [
    'array',
    '32bit'
  ],  
  uint64blk: [
    'array',
    '64bit'
  ],
  labelblk: [
    'labelarray',
    '64bit'
  ]
}

/* would be a good place to put tooltips too, if we need them */
exports.label_properties = {
  'array': {
    color: '#666699'
  },
  '64bit':{
    color: '#daa520'
  },
  '32bit':{
    color: '#daa520'
  },
  '16bit':{
    color: '#daa520'
  },
  '8bit':{
    color: '#daa520'
  },
  'labelarray':{
    color: '#ff6722'
  }

}