/**
 * Catholic Lectionary Gospel Readings & Liturgical Metadata
 * Ordinary Form (Roman Rite)
 */

export const LITURGICAL_COLORS = {
  GREEN: '#2D6A4F',
  WHITE: '#F3E9D2',
  RED: '#9E2A2B',
  PURPLE: '#5A189A',
  ROSE: '#D47391'
};

// 3-Year Sunday Gospel Cycles (Years A, B, C)
export const SUNDAY_GOSPELS = {
  // ADVENT
  advent: {
    1: {
      A: { citation: 'Matthew 24:37-44', bookId: 'matthew', chapter: 24, startVerse: 37, endVerse: 44, title: '1st Sunday of Advent' },
      B: { citation: 'Mark 13:33-37', bookId: 'mark', chapter: 13, startVerse: 33, endVerse: 37, title: '1st Sunday of Advent' },
      C: { citation: 'Luke 21:25-28, 34-36', bookId: 'luke', chapter: 21, startVerse: 25, endVerse: 36, title: '1st Sunday of Advent' }
    },
    2: {
      A: { citation: 'Matthew 3:1-12', bookId: 'matthew', chapter: 3, startVerse: 1, endVerse: 12, title: '2nd Sunday of Advent' },
      B: { citation: 'Mark 1:1-8', bookId: 'mark', chapter: 1, startVerse: 1, endVerse: 8, title: '2nd Sunday of Advent' },
      C: { citation: 'Luke 3:1-6', bookId: 'luke', chapter: 3, startVerse: 1, endVerse: 6, title: '2nd Sunday of Advent' }
    },
    3: { // Gaudete Sunday
      A: { citation: 'Matthew 11:2-11', bookId: 'matthew', chapter: 11, startVerse: 2, endVerse: 11, title: '3rd Sunday of Advent (Gaudete)', color: 'rose' },
      B: { citation: 'John 1:6-8, 19-28', bookId: 'john', chapter: 1, startVerse: 6, endVerse: 28, title: '3rd Sunday of Advent (Gaudete)', color: 'rose' },
      C: { citation: 'Luke 3:10-18', bookId: 'luke', chapter: 3, startVerse: 10, endVerse: 18, title: '3rd Sunday of Advent (Gaudete)', color: 'rose' }
    },
    4: {
      A: { citation: 'Matthew 1:18-24', bookId: 'matthew', chapter: 1, startVerse: 18, endVerse: 24, title: '4th Sunday of Advent' },
      B: { citation: 'Luke 1:26-38', bookId: 'luke', chapter: 1, startVerse: 26, endVerse: 38, title: '4th Sunday of Advent' },
      C: { citation: 'Luke 1:39-45', bookId: 'luke', chapter: 1, startVerse: 39, endVerse: 45, title: '4th Sunday of Advent' }
    }
  },

  // CHRISTMAS SEASON
  christmas: {
    holy_family: {
      A: { citation: 'Matthew 2:13-15, 19-23', bookId: 'matthew', chapter: 2, startVerse: 13, endVerse: 23, title: 'Feast of the Holy Family' },
      B: { citation: 'Luke 2:22-40', bookId: 'luke', chapter: 2, startVerse: 22, endVerse: 40, title: 'Feast of the Holy Family' },
      C: { citation: 'Luke 2:41-52', bookId: 'luke', chapter: 2, startVerse: 41, endVerse: 52, title: 'Feast of the Holy Family' }
    },
    epiphany: {
      A: { citation: 'Matthew 2:1-12', bookId: 'matthew', chapter: 2, startVerse: 1, endVerse: 12, title: 'The Epiphany of the Lord' },
      B: { citation: 'Matthew 2:1-12', bookId: 'matthew', chapter: 2, startVerse: 1, endVerse: 12, title: 'The Epiphany of the Lord' },
      C: { citation: 'Matthew 2:1-12', bookId: 'matthew', chapter: 2, startVerse: 1, endVerse: 12, title: 'The Epiphany of the Lord' }
    },
    baptism: {
      A: { citation: 'Matthew 3:13-17', bookId: 'matthew', chapter: 3, startVerse: 13, endVerse: 17, title: 'The Baptism of the Lord' },
      B: { citation: 'Mark 1:7-11', bookId: 'mark', chapter: 1, startVerse: 7, endVerse: 11, title: 'The Baptism of the Lord' },
      C: { citation: 'Luke 3:15-16, 21-22', bookId: 'luke', chapter: 3, startVerse: 15, endVerse: 22, title: 'The Baptism of the Lord' }
    }
  },

  // LENT
  lent: {
    1: {
      A: { citation: 'Matthew 4:1-11', bookId: 'matthew', chapter: 4, startVerse: 1, endVerse: 11, title: '1st Sunday of Lent' },
      B: { citation: 'Mark 1:12-15', bookId: 'mark', chapter: 1, startVerse: 12, endVerse: 15, title: '1st Sunday of Lent' },
      C: { citation: 'Luke 4:1-13', bookId: 'luke', chapter: 4, startVerse: 1, endVerse: 13, title: '1st Sunday of Lent' }
    },
    2: {
      A: { citation: 'Matthew 17:1-9', bookId: 'matthew', chapter: 17, startVerse: 1, endVerse: 9, title: '2nd Sunday of Lent (Transfiguration)' },
      B: { citation: 'Mark 9:2-10', bookId: 'mark', chapter: 9, startVerse: 2, endVerse: 10, title: '2nd Sunday of Lent (Transfiguration)' },
      C: { citation: 'Luke 9:28-36', bookId: 'luke', chapter: 9, startVerse: 28, endVerse: 36, title: '2nd Sunday of Lent (Transfiguration)' }
    },
    3: {
      A: { citation: 'John 4:5-42', bookId: 'john', chapter: 4, startVerse: 5, endVerse: 42, title: '3rd Sunday of Lent (Samaritan Woman)' },
      B: { citation: 'John 2:13-25', bookId: 'john', chapter: 2, startVerse: 13, endVerse: 25, title: '3rd Sunday of Lent (Cleansing the Temple)' },
      C: { citation: 'Luke 13:1-9', bookId: 'luke', chapter: 13, startVerse: 1, endVerse: 9, title: '3rd Sunday of Lent' }
    },
    4: { // Laetare Sunday
      A: { citation: 'John 9:1-41', bookId: 'john', chapter: 9, startVerse: 1, endVerse: 41, title: '4th Sunday of Lent (Laetare - Man Born Blind)', color: 'rose' },
      B: { citation: 'John 3:14-21', bookId: 'john', chapter: 3, startVerse: 14, endVerse: 21, title: '4th Sunday of Lent (Laetare)', color: 'rose' },
      C: { citation: 'Luke 15:1-3, 11-32', bookId: 'luke', chapter: 15, startVerse: 1, endVerse: 32, title: '4th Sunday of Lent (Laetare - Prodigal Son)', color: 'rose' }
    },
    5: {
      A: { citation: 'John 11:1-45', bookId: 'john', chapter: 11, startVerse: 1, endVerse: 45, title: '5th Sunday of Lent (Raising of Lazarus)' },
      B: { citation: 'John 12:20-33', bookId: 'john', chapter: 12, startVerse: 20, endVerse: 33, title: '5th Sunday of Lent' },
      C: { citation: 'John 8:1-11', bookId: 'john', chapter: 8, startVerse: 1, endVerse: 11, title: '5th Sunday of Lent (Adulterous Woman)' }
    },
    6: { // Palm Sunday
      A: { citation: 'Matthew 26:14-27:66', bookId: 'matthew', chapter: 26, startVerse: 14, endVerse: 75, title: 'Palm Sunday of the Passion of the Lord', color: 'red' },
      B: { citation: 'Mark 14:1-15:47', bookId: 'mark', chapter: 14, startVerse: 1, endVerse: 72, title: 'Palm Sunday of the Passion of the Lord', color: 'red' },
      C: { citation: 'Luke 22:14-23:56', bookId: 'luke', chapter: 22, startVerse: 14, endVerse: 71, title: 'Palm Sunday of the Passion of the Lord', color: 'red' }
    }
  },

  // EASTER SEASON
  easter: {
    1: { // Easter Sunday
      A: { citation: 'John 20:1-9', bookId: 'john', chapter: 20, startVerse: 1, endVerse: 9, title: 'Easter Sunday: Resurrection of the Lord', color: 'white' },
      B: { citation: 'John 20:1-9', bookId: 'john', chapter: 20, startVerse: 1, endVerse: 9, title: 'Easter Sunday: Resurrection of the Lord', color: 'white' },
      C: { citation: 'John 20:1-9', bookId: 'john', chapter: 20, startVerse: 1, endVerse: 9, title: 'Easter Sunday: Resurrection of the Lord', color: 'white' }
    },
    2: { // Divine Mercy Sunday
      A: { citation: 'John 20:19-31', bookId: 'john', chapter: 20, startVerse: 19, endVerse: 31, title: '2nd Sunday of Easter (Divine Mercy Sunday)' },
      B: { citation: 'John 20:19-31', bookId: 'john', chapter: 20, startVerse: 19, endVerse: 31, title: '2nd Sunday of Easter (Divine Mercy Sunday)' },
      C: { citation: 'John 20:19-31', bookId: 'john', chapter: 20, startVerse: 19, endVerse: 31, title: '2nd Sunday of Easter (Divine Mercy Sunday)' }
    },
    3: {
      A: { citation: 'Luke 24:13-35', bookId: 'luke', chapter: 24, startVerse: 13, endVerse: 35, title: '3rd Sunday of Easter (Road to Emmaus)' },
      B: { citation: 'Luke 24:35-48', bookId: 'luke', chapter: 24, startVerse: 35, endVerse: 48, title: '3rd Sunday of Easter' },
      C: { citation: 'John 21:1-19', bookId: 'john', chapter: 21, startVerse: 1, endVerse: 19, title: '3rd Sunday of Easter' }
    },
    4: { // Good Shepherd Sunday
      A: { citation: 'John 10:1-10', bookId: 'john', chapter: 10, startVerse: 1, endVerse: 10, title: '4th Sunday of Easter (Good Shepherd)' },
      B: { citation: 'John 10:11-18', bookId: 'john', chapter: 10, startVerse: 1, endVerse: 18, title: '4th Sunday of Easter (Good Shepherd)' },
      C: { citation: 'John 10:27-30', bookId: 'john', chapter: 10, startVerse: 27, endVerse: 30, title: '4th Sunday of Easter (Good Shepherd)' }
    },
    5: {
      A: { citation: 'John 14:1-12', bookId: 'john', chapter: 14, startVerse: 1, endVerse: 12, title: '5th Sunday of Easter' },
      B: { citation: 'John 15:1-8', bookId: 'john', chapter: 15, startVerse: 1, endVerse: 8, title: '5th Sunday of Easter (The True Vine)' },
      C: { citation: 'John 13:31-35', bookId: 'john', chapter: 13, startVerse: 31, endVerse: 35, title: '5th Sunday of Easter' }
    },
    6: {
      A: { citation: 'John 14:15-21', bookId: 'john', chapter: 14, startVerse: 15, endVerse: 21, title: '6th Sunday of Easter' },
      B: { citation: 'John 15:9-17', bookId: 'john', chapter: 15, startVerse: 9, endVerse: 17, title: '6th Sunday of Easter' },
      C: { citation: 'John 14:23-29', bookId: 'john', chapter: 14, startVerse: 23, endVerse: 29, title: '6th Sunday of Easter' }
    },
    7: {
      A: { citation: 'John 17:1-11', bookId: 'john', chapter: 17, startVerse: 1, endVerse: 11, title: '7th Sunday of Easter (High Priestly Prayer)' },
      B: { citation: 'John 17:11-19', bookId: 'john', chapter: 17, startVerse: 1, endVerse: 19, title: '7th Sunday of Easter' },
      C: { citation: 'John 17:20-26', bookId: 'john', chapter: 17, startVerse: 20, endVerse: 26, title: '7th Sunday of Easter' }
    },
    pentecost: {
      A: { citation: 'John 20:19-23', bookId: 'john', chapter: 20, startVerse: 19, endVerse: 23, title: 'Pentecost Sunday', color: 'red' },
      B: { citation: 'John 15:26-27; 16:12-15', bookId: 'john', chapter: 15, startVerse: 26, endVerse: 27, title: 'Pentecost Sunday', color: 'red' },
      C: { citation: 'John 14:15-16, 23-26', bookId: 'john', chapter: 14, startVerse: 15, endVerse: 26, title: 'Pentecost Sunday', color: 'red' }
    }
  },

  // ORDINARY TIME SUNDAYS (Weeks 1-34)
  ordinary: {
    1: { // Replaced by Baptism of the Lord
      A: { citation: 'Matthew 3:13-17', bookId: 'matthew', chapter: 3, startVerse: 13, endVerse: 17, title: '1st Sunday in Ordinary Time (Baptism of the Lord)' },
      B: { citation: 'Mark 1:7-11', bookId: 'mark', chapter: 1, startVerse: 7, endVerse: 11, title: '1st Sunday in Ordinary Time (Baptism of the Lord)' },
      C: { citation: 'Luke 3:15-16, 21-22', bookId: 'luke', chapter: 3, startVerse: 15, endVerse: 22, title: '1st Sunday in Ordinary Time (Baptism of the Lord)' }
    },
    2: {
      A: { citation: 'John 1:29-34', bookId: 'john', chapter: 1, startVerse: 29, endVerse: 34, title: '2nd Sunday in Ordinary Time' },
      B: { citation: 'John 1:35-42', bookId: 'john', chapter: 1, startVerse: 35, endVerse: 42, title: '2nd Sunday in Ordinary Time' },
      C: { citation: 'John 2:1-11', bookId: 'john', chapter: 2, startVerse: 1, endVerse: 11, title: '2nd Sunday in Ordinary Time (Wedding at Cana)' }
    },
    3: {
      A: { citation: 'Matthew 4:12-23', bookId: 'matthew', chapter: 4, startVerse: 12, endVerse: 23, title: '3rd Sunday in Ordinary Time' },
      B: { citation: 'Mark 1:14-20', bookId: 'mark', chapter: 1, startVerse: 14, endVerse: 20, title: '3rd Sunday in Ordinary Time' },
      C: { citation: 'Luke 1:1-4; 4:14-21', bookId: 'luke', chapter: 4, startVerse: 14, endVerse: 21, title: '3rd Sunday in Ordinary Time' }
    },
    4: {
      A: { citation: 'Matthew 5:1-12', bookId: 'matthew', chapter: 5, startVerse: 1, endVerse: 12, title: '4th Sunday in Ordinary Time (Beatitudes)' },
      B: { citation: 'Mark 1:21-28', bookId: 'mark', chapter: 1, startVerse: 21, endVerse: 28, title: '4th Sunday in Ordinary Time' },
      C: { citation: 'Luke 4:21-30', bookId: 'luke', chapter: 4, startVerse: 21, endVerse: 30, title: '4th Sunday in Ordinary Time' }
    },
    5: {
      A: { citation: 'Matthew 5:13-16', bookId: 'matthew', chapter: 5, startVerse: 13, endVerse: 16, title: '5th Sunday in Ordinary Time (Salt & Light)' },
      B: { citation: 'Mark 1:29-39', bookId: 'mark', chapter: 1, startVerse: 29, endVerse: 39, title: '5th Sunday in Ordinary Time' },
      C: { citation: 'Luke 5:1-11', bookId: 'luke', chapter: 5, startVerse: 1, endVerse: 11, title: '5th Sunday in Ordinary Time (Miraculous Catch)' }
    },
    6: {
      A: { citation: 'Matthew 5:17-37', bookId: 'matthew', chapter: 5, startVerse: 17, endVerse: 37, title: '6th Sunday in Ordinary Time' },
      B: { citation: 'Mark 1:40-45', bookId: 'mark', chapter: 1, startVerse: 40, endVerse: 45, title: '6th Sunday in Ordinary Time (Cleansing Leper)' },
      C: { citation: 'Luke 6:17, 20-26', bookId: 'luke', chapter: 6, startVerse: 17, endVerse: 26, title: '6th Sunday in Ordinary Time (Sermon on Plain)' }
    },
    7: {
      A: { citation: 'Matthew 5:38-48', bookId: 'matthew', chapter: 5, startVerse: 38, endVerse: 48, title: '7th Sunday in Ordinary Time (Love of Enemies)' },
      B: { citation: 'Mark 2:1-12', bookId: 'mark', chapter: 2, startVerse: 1, endVerse: 12, title: '7th Sunday in Ordinary Time (Healing Paralytic)' },
      C: { citation: 'Luke 6:27-38', bookId: 'luke', chapter: 6, startVerse: 27, endVerse: 38, title: '7th Sunday in Ordinary Time' }
    },
    8: {
      A: { citation: 'Matthew 6:24-34', bookId: 'matthew', chapter: 6, startVerse: 24, endVerse: 34, title: '8th Sunday in Ordinary Time (Lilies of the Field)' },
      B: { citation: 'Mark 2:18-22', bookId: 'mark', chapter: 2, startVerse: 18, endVerse: 22, title: '8th Sunday in Ordinary Time (New Wine in Old Wineskins)' },
      C: { citation: 'Luke 6:39-45', bookId: 'luke', chapter: 6, startVerse: 39, endVerse: 45, title: '8th Sunday in Ordinary Time' }
    },
    9: {
      A: { citation: 'Matthew 7:21-27', bookId: 'matthew', chapter: 7, startVerse: 21, endVerse: 27, title: '9th Sunday in Ordinary Time (House on Rock)' },
      B: { citation: 'Mark 2:23-3:6', bookId: 'mark', chapter: 2, startVerse: 23, endVerse: 28, title: '9th Sunday in Ordinary Time (Lord of the Sabbath)' },
      C: { citation: 'Luke 7:1-10', bookId: 'luke', chapter: 7, startVerse: 1, endVerse: 10, title: '9th Sunday in Ordinary Time (Centurion\'s Faith)' }
    },
    10: {
      A: { citation: 'Matthew 9:9-13', bookId: 'matthew', chapter: 9, startVerse: 9, endVerse: 13, title: '10th Sunday in Ordinary Time (Call of Matthew)' },
      B: { citation: 'Mark 3:20-35', bookId: 'mark', chapter: 3, startVerse: 20, endVerse: 35, title: '10th Sunday in Ordinary Time' },
      C: { citation: 'Luke 7:11-17', bookId: 'luke', chapter: 7, startVerse: 11, endVerse: 17, title: '10th Sunday in Ordinary Time (Widow of Nain)' }
    },
    11: {
      A: { citation: 'Matthew 9:36-10:8', bookId: 'matthew', chapter: 9, startVerse: 36, endVerse: 38, title: '11th Sunday in Ordinary Time' },
      B: { citation: 'Mark 4:26-34', bookId: 'mark', chapter: 4, startVerse: 26, endVerse: 34, title: '11th Sunday in Ordinary Time (Mustard Seed)' },
      C: { citation: 'Luke 7:36-8:3', bookId: 'luke', chapter: 7, startVerse: 36, endVerse: 50, title: '11th Sunday in Ordinary Time (Sinful Woman Anoints Jesus)' }
    },
    12: {
      A: { citation: 'Matthew 10:26-33', bookId: 'matthew', chapter: 10, startVerse: 26, endVerse: 33, title: '12th Sunday in Ordinary Time (Fear Not)' },
      B: { citation: 'Mark 4:35-41', bookId: 'mark', chapter: 4, startVerse: 35, endVerse: 41, title: '12th Sunday in Ordinary Time (Calming the Storm)' },
      C: { citation: 'Luke 9:18-24', bookId: 'luke', chapter: 9, startVerse: 18, endVerse: 24, title: '12th Sunday in Ordinary Time (Peter\'s Confession)' }
    },
    13: {
      A: { citation: 'Matthew 10:37-42', bookId: 'matthew', chapter: 10, startVerse: 37, endVerse: 42, title: '13th Sunday in Ordinary Time' },
      B: { citation: 'Mark 5:21-43', bookId: 'mark', chapter: 5, startVerse: 21, endVerse: 43, title: '13th Sunday in Ordinary Time (Jairus\' Daughter)' },
      C: { citation: 'Luke 9:51-62', bookId: 'luke', chapter: 9, startVerse: 51, endVerse: 62, title: '13th Sunday in Ordinary Time (Cost of Discipleship)' }
    },
    14: {
      A: { citation: 'Matthew 11:25-30', bookId: 'matthew', chapter: 11, startVerse: 25, endVerse: 30, title: '14th Sunday in Ordinary Time (My Yoke is Easy)' },
      B: { citation: 'Mark 6:1-6', bookId: 'mark', chapter: 6, startVerse: 1, endVerse: 6, title: '14th Sunday in Ordinary Time (Prophet Without Honor)' },
      C: { citation: 'Luke 10:1-12, 17-20', bookId: 'luke', chapter: 10, startVerse: 1, endVerse: 20, title: '14th Sunday in Ordinary Time (Mission of the 72)' }
    },
    15: {
      A: { citation: 'Matthew 13:1-23', bookId: 'matthew', chapter: 13, startVerse: 1, endVerse: 23, title: '15th Sunday in Ordinary Time (Parable of the Sower)' },
      B: { citation: 'Mark 6:7-13', bookId: 'mark', chapter: 6, startVerse: 7, endVerse: 13, title: '15th Sunday in Ordinary Time (Sending the Twelve)' },
      C: { citation: 'Luke 10:25-37', bookId: 'luke', chapter: 10, startVerse: 25, endVerse: 37, title: '15th Sunday in Ordinary Time (Good Samaritan)' }
    },
    16: {
      A: { citation: 'Matthew 13:24-43', bookId: 'matthew', chapter: 13, startVerse: 24, endVerse: 43, title: '16th Sunday in Ordinary Time (Wheat & Weeds)' },
      B: { citation: 'Mark 6:30-34', bookId: 'mark', chapter: 6, startVerse: 30, endVerse: 34, title: '16th Sunday in Ordinary Time (Sheep Without Shepherd)' },
      C: { citation: 'Luke 10:38-42', bookId: 'luke', chapter: 10, startVerse: 38, endVerse: 42, title: '16th Sunday in Ordinary Time (Martha and Mary)' }
    },
    17: {
      A: { citation: 'Matthew 13:44-52', bookId: 'matthew', chapter: 13, startVerse: 44, endVerse: 52, title: '17th Sunday in Ordinary Time (Treasure in Field)' },
      B: { citation: 'John 6:1-15', bookId: 'john', chapter: 6, startVerse: 1, endVerse: 15, title: '17th Sunday in Ordinary Time (Feeding of the 5,000)' },
      C: { citation: 'Luke 11:1-13', bookId: 'luke', chapter: 11, startVerse: 1, endVerse: 13, title: '17th Sunday in Ordinary Time (The Lord\'s Prayer)' }
    },
    18: {
      A: { citation: 'Matthew 14:13-21', bookId: 'matthew', chapter: 14, startVerse: 13, endVerse: 21, title: '18th Sunday in Ordinary Time (Feeding 5,000)' },
      B: { citation: 'John 6:24-35', bookId: 'john', chapter: 6, startVerse: 24, endVerse: 35, title: '18th Sunday in Ordinary Time (Bread of Life)' },
      C: { citation: 'Luke 12:13-21', bookId: 'luke', chapter: 12, startVerse: 13, endVerse: 21, title: '18th Sunday in Ordinary Time (Parable of Rich Fool)' }
    },
    19: {
      A: { citation: 'Matthew 14:22-33', bookId: 'matthew', chapter: 14, startVerse: 22, endVerse: 33, title: '19th Sunday in Ordinary Time (Walking on Water)' },
      B: { citation: 'John 6:41-51', bookId: 'john', chapter: 6, startVerse: 41, endVerse: 51, title: '19th Sunday in Ordinary Time (Bread from Heaven)' },
      C: { citation: 'Luke 12:32-48', bookId: 'luke', chapter: 12, startVerse: 32, endVerse: 48, title: '19th Sunday in Ordinary Time (Watchful Servants)' }
    },
    20: {
      A: { citation: 'Matthew 15:21-28', bookId: 'matthew', chapter: 15, startVerse: 21, endVerse: 28, title: '20th Sunday in Ordinary Time (Canaanite Woman)' },
      B: { citation: 'John 6:51-58', bookId: 'john', chapter: 6, startVerse: 51, endVerse: 58, title: '20th Sunday in Ordinary Time (True Food & Drink)' },
      C: { citation: 'Luke 12:49-53', bookId: 'luke', chapter: 12, startVerse: 49, endVerse: 53, title: '20th Sunday in Ordinary Time (I Came to Cast Fire)' }
    },
    21: {
      A: { citation: 'Matthew 16:13-20', bookId: 'matthew', chapter: 16, startVerse: 13, endVerse: 20, title: '21st Sunday in Ordinary Time (Keys of the Kingdom)' },
      B: { citation: 'John 6:60-69', bookId: 'john', chapter: 6, startVerse: 60, endVerse: 69, title: '21st Sunday in Ordinary Time (Words of Eternal Life)' },
      C: { citation: 'Luke 13:22-30', bookId: 'luke', chapter: 13, startVerse: 22, endVerse: 30, title: '21st Sunday in Ordinary Time (The Narrow Door)' }
    },
    22: {
      A: { citation: 'Matthew 16:21-27', bookId: 'matthew', chapter: 16, startVerse: 21, endVerse: 27, title: '22nd Sunday in Ordinary Time (Take Up Your Cross)' },
      B: { citation: 'Mark 7:1-8, 14-15, 21-23', bookId: 'mark', chapter: 7, startVerse: 1, endVerse: 23, title: '22nd Sunday in Ordinary Time (Traditions of Elders)' },
      C: { citation: 'Luke 14:1, 7-14', bookId: 'luke', chapter: 14, startVerse: 1, endVerse: 14, title: '22nd Sunday in Ordinary Time (Humility at Banquets)' }
    },
    23: {
      A: { citation: 'Matthew 18:15-20', bookId: 'matthew', chapter: 18, startVerse: 15, endVerse: 20, title: '23rd Sunday in Ordinary Time (Fraternal Correction)' },
      B: { citation: 'Mark 7:31-37', bookId: 'mark', chapter: 7, startVerse: 31, endVerse: 37, title: '23rd Sunday in Ordinary Time (Ephphatha)' },
      C: { citation: 'Luke 14:25-33', bookId: 'luke', chapter: 14, startVerse: 25, endVerse: 33, title: '23rd Sunday in Ordinary Time (Renouncing Possessions)' }
    },
    24: {
      A: { citation: 'Matthew 18:21-35', bookId: 'matthew', chapter: 18, startVerse: 21, endVerse: 35, title: '24th Sunday in Ordinary Time (Unforgiving Servant)' },
      B: { citation: 'Mark 8:27-35', bookId: 'mark', chapter: 8, startVerse: 27, endVerse: 35, title: '24th Sunday in Ordinary Time (Who Do You Say I Am?)' },
      C: { citation: 'Luke 15:1-32', bookId: 'luke', chapter: 15, startVerse: 1, endVerse: 32, title: '24th Sunday in Ordinary Time (The Lost Sheep & Prodigal Son)' }
    },
    25: {
      A: { citation: 'Matthew 20:1-16', bookId: 'matthew', chapter: 20, startVerse: 1, endVerse: 16, title: '25th Sunday in Ordinary Time (Laborers in Vineyard)' },
      B: { citation: 'Mark 9:30-37', bookId: 'mark', chapter: 9, startVerse: 30, endVerse: 37, title: '25th Sunday in Ordinary Time (The Greatest in Kingdom)' },
      C: { citation: 'Luke 16:1-13', bookId: 'luke', chapter: 16, startVerse: 1, endVerse: 13, title: '25th Sunday in Ordinary Time (Dishonest Steward)' }
    },
    26: {
      A: { citation: 'Matthew 21:28-32', bookId: 'matthew', chapter: 21, startVerse: 28, endVerse: 32, title: '26th Sunday in Ordinary Time (Parable of Two Sons)' },
      B: { citation: 'Mark 9:38-43, 45, 47-48', bookId: 'mark', chapter: 9, startVerse: 38, endVerse: 48, title: '26th Sunday in Ordinary Time (Whoever is Not Against Us)' },
      C: { citation: 'Luke 16:19-31', bookId: 'luke', chapter: 16, startVerse: 19, endVerse: 31, title: '26th Sunday in Ordinary Time (Rich Man and Lazarus)' }
    },
    27: {
      A: { citation: 'Matthew 21:33-43', bookId: 'matthew', chapter: 21, startVerse: 33, endVerse: 43, title: '27th Sunday in Ordinary Time (Wicked Tenants)' },
      B: { citation: 'Mark 10:2-16', bookId: 'mark', chapter: 10, startVerse: 2, endVerse: 16, title: '27th Sunday in Ordinary Time (Marriage & Little Children)' },
      C: { citation: 'Luke 17:5-10', bookId: 'luke', chapter: 17, startVerse: 5, endVerse: 10, title: '27th Sunday in Ordinary Time (Faith as a Mustard Seed)' }
    },
    28: {
      A: { citation: 'Matthew 22:1-14', bookId: 'matthew', chapter: 22, startVerse: 1, endVerse: 14, title: '28th Sunday in Ordinary Time (Wedding Banquet)' },
      B: { citation: 'Mark 10:17-30', bookId: 'mark', chapter: 10, startVerse: 17, endVerse: 30, title: '28th Sunday in Ordinary Time (Rich Young Man)' },
      C: { citation: 'Luke 17:11-19', bookId: 'luke', chapter: 17, startVerse: 11, endVerse: 19, title: '28th Sunday in Ordinary Time (Cleansing of Ten Lepers)' }
    },
    29: {
      A: { citation: 'Matthew 22:15-21', bookId: 'matthew', chapter: 22, startVerse: 15, endVerse: 21, title: '29th Sunday in Ordinary Time (Render Unto Caesar)' },
      B: { citation: 'Mark 10:35-45', bookId: 'mark', chapter: 10, startVerse: 35, endVerse: 45, title: '29th Sunday in Ordinary Time (James & John Request)' },
      C: { citation: 'Luke 18:1-8', bookId: 'luke', chapter: 18, startVerse: 1, endVerse: 8, title: '29th Sunday in Ordinary Time (Persistent Widow)' }
    },
    30: {
      A: { citation: 'Matthew 22:34-40', bookId: 'matthew', chapter: 22, startVerse: 34, endVerse: 40, title: '30th Sunday in Ordinary Time (The Great Commandment)' },
      B: { citation: 'Mark 10:46-52', bookId: 'mark', chapter: 10, startVerse: 46, endVerse: 52, title: '30th Sunday in Ordinary Time (Blind Bartimaeus)' },
      C: { citation: 'Luke 18:9-14', bookId: 'luke', chapter: 18, startVerse: 9, endVerse: 14, title: '30th Sunday in Ordinary Time (Pharisee & Tax Collector)' }
    },
    31: {
      A: { citation: 'Matthew 23:1-12', bookId: 'matthew', chapter: 23, startVerse: 1, endVerse: 12, title: '31st Sunday in Ordinary Time (The Greatest Among You)' },
      B: { citation: 'Mark 12:28-34', bookId: 'mark', chapter: 12, startVerse: 28, endVerse: 34, title: '31st Sunday in Ordinary Time (The Greatest Commandment)' },
      C: { citation: 'Luke 19:1-10', bookId: 'luke', chapter: 19, startVerse: 1, endVerse: 10, title: '31st Sunday in Ordinary Time (Zacchaeus)' }
    },
    32: {
      A: { citation: 'Matthew 25:1-13', bookId: 'matthew', chapter: 25, startVerse: 1, endVerse: 13, title: '32nd Sunday in Ordinary Time (Ten Virgins)' },
      B: { citation: 'Mark 12:38-44', bookId: 'mark', chapter: 12, startVerse: 38, endVerse: 44, title: '32nd Sunday in Ordinary Time (The Widow\'s Mite)' },
      C: { citation: 'Luke 20:27-38', bookId: 'luke', chapter: 20, startVerse: 27, endVerse: 38, title: '32nd Sunday in Ordinary Time (God of the Living)' }
    },
    33: {
      A: { citation: 'Matthew 25:14-30', bookId: 'matthew', chapter: 25, startVerse: 14, endVerse: 30, title: '33rd Sunday in Ordinary Time (Parable of the Talents)' },
      B: { citation: 'Mark 13:24-32', bookId: 'mark', chapter: 13, startVerse: 24, endVerse: 32, title: '33rd Sunday in Ordinary Time (Coming of Son of Man)' },
      C: { citation: 'Luke 21:5-19', bookId: 'luke', chapter: 21, startVerse: 5, endVerse: 19, title: '33rd Sunday in Ordinary Time (Patient Endurance)' }
    },
    34: { // Christ the King
      A: { citation: 'Matthew 25:31-46', bookId: 'matthew', chapter: 25, startVerse: 31, endVerse: 46, title: 'Solemnity of Our Lord Jesus Christ, King of the Universe', color: 'white' },
      B: { citation: 'John 18:33-37', bookId: 'john', chapter: 18, startVerse: 33, endVerse: 37, title: 'Solemnity of Our Lord Jesus Christ, King of the Universe', color: 'white' },
      C: { citation: 'Luke 23:35-43', bookId: 'luke', chapter: 23, startVerse: 35, endVerse: 43, title: 'Solemnity of Our Lord Jesus Christ, King of the Universe', color: 'white' }
    }
  }
};

// Weekday Gospel Readings in Ordinary Time (Weeks 1 to 34, Monday through Saturday)
export const WEEKDAY_ORDINARY_GOSPELS = {
  1: {
    monday: { citation: 'Mark 1:14-20', bookId: 'mark', chapter: 1, startVerse: 14, endVerse: 20 },
    tuesday: { citation: 'Mark 1:21-28', bookId: 'mark', chapter: 1, startVerse: 21, endVerse: 28 },
    wednesday: { citation: 'Mark 1:29-39', bookId: 'mark', chapter: 1, startVerse: 29, endVerse: 39 },
    thursday: { citation: 'Mark 1:40-45', bookId: 'mark', chapter: 1, startVerse: 40, endVerse: 45 },
    friday: { citation: 'Mark 2:1-12', bookId: 'mark', chapter: 2, startVerse: 1, endVerse: 12 },
    saturday: { citation: 'Mark 2:13-17', bookId: 'mark', chapter: 2, startVerse: 13, endVerse: 17 }
  },
  2: {
    monday: { citation: 'Mark 2:18-22', bookId: 'mark', chapter: 2, startVerse: 18, endVerse: 22 },
    tuesday: { citation: 'Mark 2:23-28', bookId: 'mark', chapter: 2, startVerse: 23, endVerse: 28 },
    wednesday: { citation: 'Mark 3:1-6', bookId: 'mark', chapter: 3, startVerse: 1, endVerse: 6 },
    thursday: { citation: 'Mark 3:7-12', bookId: 'mark', chapter: 3, startVerse: 7, endVerse: 12 },
    friday: { citation: 'Mark 3:13-19', bookId: 'mark', chapter: 3, startVerse: 13, endVerse: 19 },
    saturday: { citation: 'Mark 3:20-21', bookId: 'mark', chapter: 3, startVerse: 20, endVerse: 21 }
  },
  3: {
    monday: { citation: 'Mark 3:22-30', bookId: 'mark', chapter: 3, startVerse: 22, endVerse: 30 },
    tuesday: { citation: 'Mark 3:31-35', bookId: 'mark', chapter: 3, startVerse: 31, endVerse: 35 },
    wednesday: { citation: 'Mark 4:1-20', bookId: 'mark', chapter: 4, startVerse: 1, endVerse: 20 },
    thursday: { citation: 'Mark 4:21-25', bookId: 'mark', chapter: 4, startVerse: 21, endVerse: 25 },
    friday: { citation: 'Mark 4:26-34', bookId: 'mark', chapter: 4, startVerse: 26, endVerse: 34 },
    saturday: { citation: 'Mark 4:35-41', bookId: 'mark', chapter: 4, startVerse: 35, endVerse: 41 }
  },
  4: {
    monday: { citation: 'Mark 5:1-20', bookId: 'mark', chapter: 5, startVerse: 1, endVerse: 20 },
    tuesday: { citation: 'Mark 5:21-43', bookId: 'mark', chapter: 5, startVerse: 21, endVerse: 43 },
    wednesday: { citation: 'Mark 6:1-6', bookId: 'mark', chapter: 6, startVerse: 1, endVerse: 6 },
    thursday: { citation: 'Mark 6:7-13', bookId: 'mark', chapter: 6, startVerse: 7, endVerse: 13 },
    friday: { citation: 'Mark 6:14-29', bookId: 'mark', chapter: 6, startVerse: 14, endVerse: 29 },
    saturday: { citation: 'Mark 6:30-34', bookId: 'mark', chapter: 6, startVerse: 30, endVerse: 34 }
  },
  5: {
    monday: { citation: 'Mark 6:53-56', bookId: 'mark', chapter: 6, startVerse: 53, endVerse: 56 },
    tuesday: { citation: 'Mark 7:1-13', bookId: 'mark', chapter: 7, startVerse: 1, endVerse: 13 },
    wednesday: { citation: 'Mark 7:14-23', bookId: 'mark', chapter: 7, startVerse: 1, endVerse: 23 },
    thursday: { citation: 'Mark 7:24-30', bookId: 'mark', chapter: 7, startVerse: 24, endVerse: 30 },
    friday: { citation: 'Mark 7:31-37', bookId: 'mark', chapter: 7, startVerse: 31, endVerse: 37 },
    saturday: { citation: 'Mark 8:1-10', bookId: 'mark', chapter: 8, startVerse: 1, endVerse: 10 }
  },
  6: {
    monday: { citation: 'Mark 8:11-13', bookId: 'mark', chapter: 8, startVerse: 11, endVerse: 13 },
    tuesday: { citation: 'Mark 8:14-21', bookId: 'mark', chapter: 8, startVerse: 14, endVerse: 21 },
    wednesday: { citation: 'Mark 8:22-26', bookId: 'mark', chapter: 8, startVerse: 22, endVerse: 26 },
    thursday: { citation: 'Mark 8:27-33', bookId: 'mark', chapter: 8, startVerse: 27, endVerse: 33 },
    friday: { citation: 'Mark 8:34-9:1', bookId: 'mark', chapter: 8, startVerse: 34, endVerse: 38 },
    saturday: { citation: 'Mark 9:2-13', bookId: 'mark', chapter: 9, startVerse: 2, endVerse: 13 }
  },
  7: {
    monday: { citation: 'Mark 9:14-29', bookId: 'mark', chapter: 9, startVerse: 14, endVerse: 29 },
    tuesday: { citation: 'Mark 9:30-37', bookId: 'mark', chapter: 9, startVerse: 30, endVerse: 37 },
    wednesday: { citation: 'Mark 9:38-40', bookId: 'mark', chapter: 9, startVerse: 38, endVerse: 40 },
    thursday: { citation: 'Mark 9:41-50', bookId: 'mark', chapter: 9, startVerse: 41, endVerse: 50 },
    friday: { citation: 'Mark 10:1-12', bookId: 'mark', chapter: 10, startVerse: 1, endVerse: 12 },
    saturday: { citation: 'Mark 10:13-16', bookId: 'mark', chapter: 10, startVerse: 1, endVerse: 16 }
  },
  8: {
    monday: { citation: 'Mark 10:17-27', bookId: 'mark', chapter: 10, startVerse: 17, endVerse: 27 },
    tuesday: { citation: 'Mark 10:28-31', bookId: 'mark', chapter: 10, startVerse: 28, endVerse: 31 },
    wednesday: { citation: 'Mark 10:32-45', bookId: 'mark', chapter: 10, startVerse: 32, endVerse: 45 },
    thursday: { citation: 'Mark 10:46-52', bookId: 'mark', chapter: 10, startVerse: 46, endVerse: 52 },
    friday: { citation: 'Mark 11:11-26', bookId: 'mark', chapter: 11, startVerse: 11, endVerse: 26 },
    saturday: { citation: 'Mark 11:27-33', bookId: 'mark', chapter: 11, startVerse: 27, endVerse: 33 }
  },
  9: {
    monday: { citation: 'Mark 12:1-12', bookId: 'mark', chapter: 12, startVerse: 1, endVerse: 12 },
    tuesday: { citation: 'Mark 12:13-17', bookId: 'mark', chapter: 12, startVerse: 13, endVerse: 17 },
    wednesday: { citation: 'Mark 12:18-27', bookId: 'mark', chapter: 12, startVerse: 18, endVerse: 27 },
    thursday: { citation: 'Mark 12:28-34', bookId: 'mark', chapter: 12, startVerse: 28, endVerse: 34 },
    friday: { citation: 'Mark 12:35-37', bookId: 'mark', chapter: 12, startVerse: 35, endVerse: 37 },
    saturday: { citation: 'Mark 12:38-44', bookId: 'mark', chapter: 12, startVerse: 38, endVerse: 44 }
  },
  10: {
    monday: { citation: 'Matthew 5:1-12', bookId: 'matthew', chapter: 5, startVerse: 1, endVerse: 12 },
    tuesday: { citation: 'Matthew 5:13-16', bookId: 'matthew', chapter: 5, startVerse: 13, endVerse: 16 },
    wednesday: { citation: 'Matthew 5:17-19', bookId: 'matthew', chapter: 5, startVerse: 17, endVerse: 19 },
    thursday: { citation: 'Matthew 5:20-26', bookId: 'matthew', chapter: 5, startVerse: 20, endVerse: 26 },
    friday: { citation: 'Matthew 5:27-32', bookId: 'matthew', chapter: 5, startVerse: 27, endVerse: 32 },
    saturday: { citation: 'Matthew 5:33-37', bookId: 'matthew', chapter: 5, startVerse: 33, endVerse: 37 }
  },
  11: {
    monday: { citation: 'Matthew 5:38-42', bookId: 'matthew', chapter: 5, startVerse: 38, endVerse: 42 },
    tuesday: { citation: 'Matthew 5:43-48', bookId: 'matthew', chapter: 5, startVerse: 43, endVerse: 48 },
    wednesday: { citation: 'Matthew 6:1-6, 16-18', bookId: 'matthew', chapter: 6, startVerse: 1, endVerse: 18 },
    thursday: { citation: 'Matthew 6:7-15', bookId: 'matthew', chapter: 6, startVerse: 7, endVerse: 15 },
    friday: { citation: 'Matthew 6:19-23', bookId: 'matthew', chapter: 6, startVerse: 19, endVerse: 23 },
    saturday: { citation: 'Matthew 6:24-34', bookId: 'matthew', chapter: 6, startVerse: 24, endVerse: 34 }
  },
  12: {
    monday: { citation: 'Matthew 7:1-5', bookId: 'matthew', chapter: 7, startVerse: 1, endVerse: 5 },
    tuesday: { citation: 'Matthew 7:6, 12-14', bookId: 'matthew', chapter: 7, startVerse: 6, endVerse: 14 },
    wednesday: { citation: 'Matthew 7:15-20', bookId: 'matthew', chapter: 7, startVerse: 15, endVerse: 20 },
    thursday: { citation: 'Matthew 7:21-29', bookId: 'matthew', chapter: 7, startVerse: 21, endVerse: 29 },
    friday: { citation: 'Matthew 8:1-4', bookId: 'matthew', chapter: 8, startVerse: 1, endVerse: 4 },
    saturday: { citation: 'Matthew 8:5-17', bookId: 'matthew', chapter: 8, startVerse: 5, endVerse: 17 }
  },
  13: {
    monday: { citation: 'Matthew 8:18-22', bookId: 'matthew', chapter: 8, startVerse: 18, endVerse: 22 },
    tuesday: { citation: 'Matthew 8:23-27', bookId: 'matthew', chapter: 8, startVerse: 23, endVerse: 27 },
    wednesday: { citation: 'Matthew 8:28-34', bookId: 'matthew', chapter: 8, startVerse: 28, endVerse: 34 },
    thursday: { citation: 'Matthew 9:1-8', bookId: 'matthew', chapter: 9, startVerse: 1, endVerse: 8 },
    friday: { citation: 'Matthew 9:9-13', bookId: 'matthew', chapter: 9, startVerse: 9, endVerse: 13 },
    saturday: { citation: 'Matthew 9:14-17', bookId: 'matthew', chapter: 9, startVerse: 14, endVerse: 17 }
  },
  14: {
    monday: { citation: 'Matthew 9:18-26', bookId: 'matthew', chapter: 9, startVerse: 18, endVerse: 26 },
    tuesday: { citation: 'Matthew 9:32-38', bookId: 'matthew', chapter: 9, startVerse: 32, endVerse: 38 },
    wednesday: { citation: 'Matthew 10:1-7', bookId: 'matthew', chapter: 10, startVerse: 1, endVerse: 7 },
    thursday: { citation: 'Matthew 10:7-15', bookId: 'matthew', chapter: 10, startVerse: 7, endVerse: 15 },
    friday: { citation: 'Matthew 10:16-23', bookId: 'matthew', chapter: 10, startVerse: 16, endVerse: 23 },
    saturday: { citation: 'Matthew 10:24-33', bookId: 'matthew', chapter: 10, startVerse: 24, endVerse: 33 }
  },
  15: {
    monday: { citation: 'Matthew 10:34-11:1', bookId: 'matthew', chapter: 10, startVerse: 34, endVerse: 42 },
    tuesday: { citation: 'Matthew 11:20-24', bookId: 'matthew', chapter: 11, startVerse: 20, endVerse: 24 },
    wednesday: { citation: 'Matthew 11:25-27', bookId: 'matthew', chapter: 11, startVerse: 25, endVerse: 27 },
    thursday: { citation: 'Matthew 11:28-30', bookId: 'matthew', chapter: 11, startVerse: 28, endVerse: 30 },
    friday: { citation: 'Matthew 12:1-8', bookId: 'matthew', chapter: 12, startVerse: 1, endVerse: 8 },
    saturday: { citation: 'Matthew 12:14-21', bookId: 'matthew', chapter: 12, startVerse: 14, endVerse: 21 }
  },
  16: {
    monday: { citation: 'Matthew 12:38-42', bookId: 'matthew', chapter: 12, startVerse: 38, endVerse: 42 },
    tuesday: { citation: 'Matthew 12:46-50', bookId: 'matthew', chapter: 12, startVerse: 46, endVerse: 50 },
    wednesday: { citation: 'Matthew 13:1-9', bookId: 'matthew', chapter: 13, startVerse: 1, endVerse: 9 },
    thursday: { citation: 'Matthew 13:10-17', bookId: 'matthew', chapter: 13, startVerse: 10, endVerse: 17 },
    friday: { citation: 'Matthew 13:18-23', bookId: 'matthew', chapter: 13, startVerse: 18, endVerse: 23 },
    saturday: { citation: 'Matthew 13:24-30', bookId: 'matthew', chapter: 13, startVerse: 24, endVerse: 30 }
  },
  17: {
    monday: { citation: 'Matthew 13:31-35', bookId: 'matthew', chapter: 13, startVerse: 31, endVerse: 35 },
    tuesday: { citation: 'Matthew 13:36-43', bookId: 'matthew', chapter: 13, startVerse: 36, endVerse: 43 },
    wednesday: { citation: 'Matthew 13:44-46', bookId: 'matthew', chapter: 13, startVerse: 44, endVerse: 46 },
    thursday: { citation: 'Matthew 13:47-53', bookId: 'matthew', chapter: 13, startVerse: 47, endVerse: 53 },
    friday: { citation: 'Matthew 13:54-58', bookId: 'matthew', chapter: 13, startVerse: 54, endVerse: 58 },
    saturday: { citation: 'Matthew 14:1-12', bookId: 'matthew', chapter: 14, startVerse: 1, endVerse: 12 }
  },
  18: {
    monday: { citation: 'Matthew 14:13-21', bookId: 'matthew', chapter: 14, startVerse: 1, endVerse: 21 },
    tuesday: { citation: 'Matthew 14:22-36', bookId: 'matthew', chapter: 14, startVerse: 22, endVerse: 36 },
    wednesday: { citation: 'Matthew 15:21-28', bookId: 'matthew', chapter: 15, startVerse: 21, endVerse: 28 },
    thursday: { citation: 'Matthew 16:13-23', bookId: 'matthew', chapter: 16, startVerse: 13, endVerse: 23 },
    friday: { citation: 'Matthew 16:24-28', bookId: 'matthew', chapter: 16, startVerse: 24, endVerse: 28 },
    saturday: { citation: 'Matthew 17:14-20', bookId: 'matthew', chapter: 17, startVerse: 14, endVerse: 20 }
  },
  19: {
    monday: { citation: 'Matthew 17:22-27', bookId: 'matthew', chapter: 17, startVerse: 22, endVerse: 27 },
    tuesday: { citation: 'Matthew 18:1-5, 10, 12-14', bookId: 'matthew', chapter: 18, startVerse: 1, endVerse: 14 },
    wednesday: { citation: 'Matthew 18:15-20', bookId: 'matthew', chapter: 18, startVerse: 15, endVerse: 20 },
    thursday: { citation: 'Matthew 18:21-19:1', bookId: 'matthew', chapter: 18, startVerse: 21, endVerse: 35 },
    friday: { citation: 'Matthew 19:3-12', bookId: 'matthew', chapter: 19, startVerse: 3, endVerse: 12 },
    saturday: { citation: 'Matthew 19:13-15', bookId: 'matthew', chapter: 19, startVerse: 13, endVerse: 15 }
  },
  20: {
    monday: { citation: 'Matthew 19:16-22', bookId: 'matthew', chapter: 19, startVerse: 16, endVerse: 22 },
    tuesday: { citation: 'Matthew 19:23-30', bookId: 'matthew', chapter: 19, startVerse: 23, endVerse: 30 },
    wednesday: { citation: 'Matthew 20:1-16', bookId: 'matthew', chapter: 20, startVerse: 1, endVerse: 16 },
    thursday: { citation: 'Matthew 22:1-14', bookId: 'matthew', chapter: 22, startVerse: 1, endVerse: 14 },
    friday: { citation: 'Matthew 22:34-40', bookId: 'matthew', chapter: 22, startVerse: 34, endVerse: 40 },
    saturday: { citation: 'Matthew 23:1-12', bookId: 'matthew', chapter: 23, startVerse: 1, endVerse: 12 }
  },
  21: {
    monday: { citation: 'Matthew 23:13-22', bookId: 'matthew', chapter: 23, startVerse: 13, endVerse: 22 },
    tuesday: { citation: 'Matthew 23:23-26', bookId: 'matthew', chapter: 23, startVerse: 23, endVerse: 26 },
    wednesday: { citation: 'Matthew 23:27-32', bookId: 'matthew', chapter: 23, startVerse: 27, endVerse: 32 },
    thursday: { citation: 'Matthew 24:42-51', bookId: 'matthew', chapter: 24, startVerse: 42, endVerse: 51 },
    friday: { citation: 'Matthew 25:1-13', bookId: 'matthew', chapter: 25, startVerse: 1, endVerse: 13 },
    saturday: { citation: 'Matthew 25:14-30', bookId: 'matthew', chapter: 25, startVerse: 14, endVerse: 30 }
  },
  22: {
    monday: { citation: 'Luke 4:16-30', bookId: 'luke', chapter: 4, startVerse: 16, endVerse: 30 },
    tuesday: { citation: 'Luke 4:31-37', bookId: 'luke', chapter: 4, startVerse: 31, endVerse: 37 },
    wednesday: { citation: 'Luke 4:38-44', bookId: 'luke', chapter: 4, startVerse: 38, endVerse: 44 },
    thursday: { citation: 'Luke 5:1-11', bookId: 'luke', chapter: 5, startVerse: 1, endVerse: 11 },
    friday: { citation: 'Luke 5:33-39', bookId: 'luke', chapter: 5, startVerse: 33, endVerse: 39 },
    saturday: { citation: 'Luke 6:1-5', bookId: 'luke', chapter: 6, startVerse: 1, endVerse: 5 }
  },
  23: {
    monday: { citation: 'Luke 6:6-11', bookId: 'luke', chapter: 6, startVerse: 6, endVerse: 11 },
    tuesday: { citation: 'Luke 6:12-19', bookId: 'luke', chapter: 6, startVerse: 12, endVerse: 19 },
    wednesday: { citation: 'Luke 6:20-26', bookId: 'luke', chapter: 6, startVerse: 20, endVerse: 26 },
    thursday: { citation: 'Luke 6:27-38', bookId: 'luke', chapter: 6, startVerse: 27, endVerse: 38 },
    friday: { citation: 'Luke 6:39-42', bookId: 'luke', chapter: 6, startVerse: 39, endVerse: 42 },
    saturday: { citation: 'Luke 6:43-49', bookId: 'luke', chapter: 6, startVerse: 43, endVerse: 49 }
  },
  24: {
    monday: { citation: 'Luke 7:1-10', bookId: 'luke', chapter: 7, startVerse: 1, endVerse: 10 },
    tuesday: { citation: 'Luke 7:11-17', bookId: 'luke', chapter: 7, startVerse: 11, endVerse: 17 },
    wednesday: { citation: 'Luke 7:31-35', bookId: 'luke', chapter: 7, startVerse: 31, endVerse: 35 },
    thursday: { citation: 'Luke 7:36-50', bookId: 'luke', chapter: 7, startVerse: 36, endVerse: 50 },
    friday: { citation: 'Luke 8:1-3', bookId: 'luke', chapter: 8, startVerse: 1, endVerse: 3 },
    saturday: { citation: 'Luke 8:4-15', bookId: 'luke', chapter: 8, startVerse: 4, endVerse: 15 }
  },
  25: {
    monday: { citation: 'Luke 8:16-18', bookId: 'luke', chapter: 8, startVerse: 16, endVerse: 18 },
    tuesday: { citation: 'Luke 8:19-21', bookId: 'luke', chapter: 8, startVerse: 19, endVerse: 21 },
    wednesday: { citation: 'Luke 9:1-6', bookId: 'luke', chapter: 9, startVerse: 1, endVerse: 6 },
    thursday: { citation: 'Luke 9:7-9', bookId: 'luke', chapter: 9, startVerse: 7, endVerse: 9 },
    friday: { citation: 'Luke 9:18-22', bookId: 'luke', chapter: 9, startVerse: 18, endVerse: 22 },
    saturday: { citation: 'Luke 9:43-45', bookId: 'luke', chapter: 9, startVerse: 43, endVerse: 45 }
  },
  26: {
    monday: { citation: 'Luke 9:46-50', bookId: 'luke', chapter: 9, startVerse: 46, endVerse: 50 },
    tuesday: { citation: 'Luke 9:51-56', bookId: 'luke', chapter: 9, startVerse: 51, endVerse: 56 },
    wednesday: { citation: 'Luke 9:57-62', bookId: 'luke', chapter: 9, startVerse: 57, endVerse: 62 },
    thursday: { citation: 'Luke 10:1-12', bookId: 'luke', chapter: 10, startVerse: 1, endVerse: 12 },
    friday: { citation: 'Luke 10:13-16', bookId: 'luke', chapter: 10, startVerse: 13, endVerse: 16 },
    saturday: { citation: 'Luke 10:17-24', bookId: 'luke', chapter: 10, startVerse: 17, endVerse: 24 }
  },
  27: {
    monday: { citation: 'Luke 10:25-37', bookId: 'luke', chapter: 10, startVerse: 25, endVerse: 37 },
    tuesday: { citation: 'Luke 10:38-42', bookId: 'luke', chapter: 10, startVerse: 38, endVerse: 42 },
    wednesday: { citation: 'Luke 11:1-4', bookId: 'luke', chapter: 11, startVerse: 1, endVerse: 4 },
    thursday: { citation: 'Luke 11:5-13', bookId: 'luke', chapter: 11, startVerse: 5, endVerse: 13 },
    friday: { citation: 'Luke 11:15-26', bookId: 'luke', chapter: 11, startVerse: 15, endVerse: 26 },
    saturday: { citation: 'Luke 11:27-28', bookId: 'luke', chapter: 11, startVerse: 27, endVerse: 28 }
  },
  28: {
    monday: { citation: 'Luke 11:29-32', bookId: 'luke', chapter: 11, startVerse: 29, endVerse: 32 },
    tuesday: { citation: 'Luke 11:37-41', bookId: 'luke', chapter: 11, startVerse: 37, endVerse: 41 },
    wednesday: { citation: 'Luke 11:42-46', bookId: 'luke', chapter: 11, startVerse: 42, endVerse: 46 },
    thursday: { citation: 'Luke 11:47-54', bookId: 'luke', chapter: 11, startVerse: 47, endVerse: 54 },
    friday: { citation: 'Luke 12:1-7', bookId: 'luke', chapter: 12, startVerse: 1, endVerse: 7 },
    saturday: { citation: 'Luke 12:8-12', bookId: 'luke', chapter: 12, startVerse: 8, endVerse: 12 }
  },
  29: {
    monday: { citation: 'Luke 12:13-21', bookId: 'luke', chapter: 12, startVerse: 13, endVerse: 21 },
    tuesday: { citation: 'Luke 12:35-38', bookId: 'luke', chapter: 12, startVerse: 35, endVerse: 38 },
    wednesday: { citation: 'Luke 12:39-48', bookId: 'luke', chapter: 12, startVerse: 39, endVerse: 48 },
    thursday: { citation: 'Luke 12:49-53', bookId: 'luke', chapter: 12, startVerse: 49, endVerse: 53 },
    friday: { citation: 'Luke 12:54-59', bookId: 'luke', chapter: 12, startVerse: 54, endVerse: 59 },
    saturday: { citation: 'Luke 13:1-9', bookId: 'luke', chapter: 13, startVerse: 1, endVerse: 9 }
  },
  30: {
    monday: { citation: 'Luke 13:10-17', bookId: 'luke', chapter: 13, startVerse: 10, endVerse: 17 },
    tuesday: { citation: 'Luke 13:18-21', bookId: 'luke', chapter: 13, startVerse: 18, endVerse: 21 },
    wednesday: { citation: 'Luke 13:22-30', bookId: 'luke', chapter: 13, startVerse: 22, endVerse: 30 },
    thursday: { citation: 'Luke 13:31-35', bookId: 'luke', chapter: 13, startVerse: 31, endVerse: 35 },
    friday: { citation: 'Luke 14:1-6', bookId: 'luke', chapter: 14, startVerse: 1, endVerse: 6 },
    saturday: { citation: 'Luke 14:1, 7-11', bookId: 'luke', chapter: 14, startVerse: 1, endVerse: 11 }
  },
  31: {
    monday: { citation: 'Luke 14:12-14', bookId: 'luke', chapter: 14, startVerse: 12, endVerse: 14 },
    tuesday: { citation: 'Luke 14:15-24', bookId: 'luke', chapter: 14, startVerse: 15, endVerse: 24 },
    wednesday: { citation: 'Luke 14:25-33', bookId: 'luke', chapter: 14, startVerse: 25, endVerse: 33 },
    thursday: { citation: 'Luke 15:1-10', bookId: 'luke', chapter: 15, startVerse: 1, endVerse: 10 },
    friday: { citation: 'Luke 16:1-8', bookId: 'luke', chapter: 16, startVerse: 1, endVerse: 8 },
    saturday: { citation: 'Luke 16:9-15', bookId: 'luke', chapter: 16, startVerse: 9, endVerse: 15 }
  },
  32: {
    monday: { citation: 'Luke 17:1-6', bookId: 'luke', chapter: 17, startVerse: 1, endVerse: 6 },
    tuesday: { citation: 'Luke 17:7-10', bookId: 'luke', chapter: 17, startVerse: 7, endVerse: 10 },
    wednesday: { citation: 'Luke 17:11-19', bookId: 'luke', chapter: 17, startVerse: 11, endVerse: 19 },
    thursday: { citation: 'Luke 17:20-25', bookId: 'luke', chapter: 17, startVerse: 20, endVerse: 25 },
    friday: { citation: 'Luke 17:26-37', bookId: 'luke', chapter: 17, startVerse: 26, endVerse: 37 },
    saturday: { citation: 'Luke 18:1-8', bookId: 'luke', chapter: 18, startVerse: 1, endVerse: 8 }
  },
  33: {
    monday: { citation: 'Luke 18:35-43', bookId: 'luke', chapter: 18, startVerse: 35, endVerse: 43 },
    tuesday: { citation: 'Luke 19:1-10', bookId: 'luke', chapter: 19, startVerse: 1, endVerse: 10 },
    wednesday: { citation: 'Luke 19:11-28', bookId: 'luke', chapter: 19, startVerse: 11, endVerse: 28 },
    thursday: { citation: 'Luke 19:41-44', bookId: 'luke', chapter: 19, startVerse: 41, endVerse: 44 },
    friday: { citation: 'Luke 19:45-48', bookId: 'luke', chapter: 19, startVerse: 45, endVerse: 48 },
    saturday: { citation: 'Luke 20:27-40', bookId: 'luke', chapter: 20, startVerse: 27, endVerse: 40 }
  },
  34: {
    monday: { citation: 'Luke 21:1-4', bookId: 'luke', chapter: 21, startVerse: 1, endVerse: 4 },
    tuesday: { citation: 'Luke 21:5-11', bookId: 'luke', chapter: 21, startVerse: 5, endVerse: 11 },
    wednesday: { citation: 'Luke 21:12-19', bookId: 'luke', chapter: 21, startVerse: 12, endVerse: 19 },
    thursday: { citation: 'Luke 21:20-28', bookId: 'luke', chapter: 21, startVerse: 20, endVerse: 28 },
    friday: { citation: 'Luke 21:29-33', bookId: 'luke', chapter: 21, startVerse: 29, endVerse: 33 },
    saturday: { citation: 'Luke 21:34-36', bookId: 'luke', chapter: 21, startVerse: 34, endVerse: 36 }
  }
};

// Fixed Solemnities and Major Feasts (Month-Day)
export const FIXED_SOLEMNITIES_AND_FEASTS = {
  '01-01': { title: 'Solemnity of Mary, the Holy Mother of God', color: 'white', citation: 'Luke 2:16-21', bookId: 'luke', chapter: 2, startVerse: 16, endVerse: 21 },
  '01-06': { title: 'The Epiphany of the Lord', color: 'white', citation: 'Matthew 2:1-12', bookId: 'matthew', chapter: 2, startVerse: 1, endVerse: 12 },
  '01-25': { title: 'Feast of the Conversion of Saint Paul the Apostle', color: 'white', citation: 'Mark 16:15-18', bookId: 'mark', chapter: 16, startVerse: 15, endVerse: 18 },
  '02-02': { title: 'Feast of the Presentation of the Lord (Candlemas)', color: 'white', citation: 'Luke 2:22-40', bookId: 'luke', chapter: 2, startVerse: 22, endVerse: 40 },
  '02-22': { title: 'Feast of the Chair of Saint Peter the Apostle', color: 'white', citation: 'Matthew 16:13-19', bookId: 'matthew', chapter: 16, startVerse: 13, endVerse: 19 },
  '03-19': { title: 'Solemnity of Saint Joseph, Spouse of the Blessed Virgin Mary', color: 'white', citation: 'Matthew 1:16, 18-21, 24', bookId: 'matthew', chapter: 1, startVerse: 16, endVerse: 24 },
  '03-25': { title: 'Solemnity of the Annunciation of the Lord', color: 'white', citation: 'Luke 1:26-38', bookId: 'luke', chapter: 1, startVerse: 26, endVerse: 38 },
  '04-25': { title: 'Feast of Saint Mark, Evangelist', color: 'red', citation: 'Mark 16:15-20', bookId: 'mark', chapter: 16, startVerse: 15, endVerse: 20 },
  '05-01': { title: 'Memorial of Saint Joseph the Worker', color: 'white', citation: 'Matthew 13:54-58', bookId: 'matthew', chapter: 13, startVerse: 54, endVerse: 58 },
  '05-03': { title: 'Feast of Saints Philip and James, Apostles', color: 'red', citation: 'John 14:6-14', bookId: 'john', chapter: 14, startVerse: 6, endVerse: 14 },
  '05-14': { title: 'Feast of Saint Matthias, Apostle', color: 'red', citation: 'John 15:9-17', bookId: 'john', chapter: 15, startVerse: 9, endVerse: 17 },
  '05-31': { title: 'Feast of the Visitation of the Blessed Virgin Mary', color: 'white', citation: 'Luke 1:39-56', bookId: 'luke', chapter: 1, startVerse: 39, endVerse: 56 },
  '06-24': { title: 'Solemnity of the Nativity of Saint John the Baptist', color: 'white', citation: 'Luke 1:57-66, 80', bookId: 'luke', chapter: 1, startVerse: 57, endVerse: 80 },
  '06-29': { title: 'Solemnity of Saints Peter and Paul, Apostles', color: 'red', citation: 'Matthew 16:13-19', bookId: 'matthew', chapter: 16, startVerse: 13, endVerse: 19 },
  '07-03': { title: 'Feast of Saint Thomas, Apostle', color: 'red', citation: 'John 20:24-29', bookId: 'john', chapter: 20, startVerse: 24, endVerse: 29 },
  '07-22': { title: 'Feast of Saint Mary Magdalene', color: 'white', citation: 'John 20:1-2, 11-18', bookId: 'john', chapter: 20, startVerse: 1, endVerse: 18 },
  '07-25': { title: 'Feast of Saint James, Apostle', color: 'red', citation: 'Matthew 20:20-28', bookId: 'matthew', chapter: 20, startVerse: 20, endVerse: 28 },
  '08-06': { title: 'Feast of the Transfiguration of the Lord', color: 'white', citation: 'Matthew 17:1-9', bookId: 'matthew', chapter: 17, startVerse: 1, endVerse: 9 },
  '08-10': { title: 'Feast of Saint Lawrence, Deacon and Martyr', color: 'red', citation: 'John 12:24-26', bookId: 'john', chapter: 12, startVerse: 24, endVerse: 26 },
  '08-14': { title: 'Memorial of Saint Maximilian Mary Kolbe, Priest and Martyr', color: 'red', citation: 'Matthew 19:3-12', bookId: 'matthew', chapter: 19, startVerse: 3, endVerse: 12 },
  '08-15': { title: 'Solemnity of the Assumption of the Blessed Virgin Mary', color: 'white', citation: 'Luke 1:39-56', bookId: 'luke', chapter: 1, startVerse: 39, endVerse: 56 },
  '08-22': { title: 'Memorial of the Queenship of the Blessed Virgin Mary', color: 'white', citation: 'Luke 1:26-38', bookId: 'luke', chapter: 1, startVerse: 26, endVerse: 38 },
  '08-24': { title: 'Feast of Saint Bartholomew, Apostle', color: 'red', citation: 'John 1:45-51', bookId: 'john', chapter: 1, startVerse: 45, endVerse: 51 },
  '08-29': { title: 'Memorial of the Passion of Saint John the Baptist', color: 'red', citation: 'Mark 6:17-29', bookId: 'mark', chapter: 6, startVerse: 17, endVerse: 29 },
  '09-08': { title: 'Feast of the Nativity of the Blessed Virgin Mary', color: 'white', citation: 'Matthew 1:1-16, 18-23', bookId: 'matthew', chapter: 1, startVerse: 1, endVerse: 23 },
  '09-14': { title: 'Feast of the Exaltation of the Holy Cross', color: 'red', citation: 'John 3:13-17', bookId: 'john', chapter: 3, startVerse: 13, endVerse: 17 },
  '09-15': { title: 'Memorial of Our Lady of Sorrows', color: 'white', citation: 'John 19:25-27', bookId: 'john', chapter: 19, startVerse: 25, endVerse: 27 },
  '09-21': { title: 'Feast of Saint Matthew, Apostle and Evangelist', color: 'red', citation: 'Matthew 9:9-13', bookId: 'matthew', chapter: 9, startVerse: 9, endVerse: 13 },
  '09-29': { title: 'Feast of Saints Michael, Gabriel, and Raphael, Archangels', color: 'white', citation: 'John 1:47-51', bookId: 'john', chapter: 1, startVerse: 47, endVerse: 51 },
  '10-02': { title: 'Memorial of the Guardian Angels', color: 'white', citation: 'Matthew 18:1-5, 10', bookId: 'matthew', chapter: 18, startVerse: 1, endVerse: 10 },
  '10-07': { title: 'Memorial of Our Lady of the Rosary', color: 'white', citation: 'Luke 1:26-38', bookId: 'luke', chapter: 1, startVerse: 26, endVerse: 38 },
  '10-18': { title: 'Feast of Saint Luke, Evangelist', color: 'red', citation: 'Luke 10:1-9', bookId: 'luke', chapter: 10, startVerse: 1, endVerse: 9 },
  '10-28': { title: 'Feast of Saints Simon and Jude, Apostles', color: 'red', citation: 'Luke 6:12-16', bookId: 'luke', chapter: 6, startVerse: 12, endVerse: 16 },
  '11-01': { title: 'Solemnity of All Saints', color: 'white', citation: 'Matthew 5:1-12', bookId: 'matthew', chapter: 5, startVerse: 1, endVerse: 12 },
  '11-02': { title: 'The Commemoration of All the Faithful Departed (All Souls\' Day)', color: 'purple', citation: 'John 6:37-40', bookId: 'john', chapter: 6, startVerse: 37, endVerse: 40 },
  '11-09': { title: 'Feast of the Dedication of the Lateran Basilica in Rome', color: 'white', citation: 'John 2:13-22', bookId: 'john', chapter: 2, startVerse: 13, endVerse: 22 },
  '11-30': { title: 'Feast of Saint Andrew, Apostle', color: 'red', citation: 'Matthew 4:18-22', bookId: 'matthew', chapter: 4, startVerse: 18, endVerse: 22 },
  '12-08': { title: 'Solemnity of the Immaculate Conception of the Blessed Virgin Mary', color: 'white', citation: 'Luke 1:26-38', bookId: 'luke', chapter: 1, startVerse: 26, endVerse: 38 },
  '12-12': { title: 'Feast of Our Lady of Guadalupe', color: 'white', citation: 'Luke 1:39-47', bookId: 'luke', chapter: 1, startVerse: 39, endVerse: 47 },
  '12-25': { title: 'The Nativity of the Lord (Christmas Day)', color: 'white', citation: 'John 1:1-18', bookId: 'john', chapter: 1, startVerse: 1, endVerse: 18 },
  '12-26': { title: 'Feast of Saint Stephen, the First Martyr', color: 'red', citation: 'Matthew 10:17-22', bookId: 'matthew', chapter: 10, startVerse: 17, endVerse: 22 },
  '12-27': { title: 'Feast of Saint John, Apostle and Evangelist', color: 'white', citation: 'John 20:1-8', bookId: 'john', chapter: 20, startVerse: 1, endVerse: 8 },
  '12-28': { title: 'Feast of the Holy Innocents, Martyrs', color: 'red', citation: 'Matthew 2:13-18', bookId: 'matthew', chapter: 2, startVerse: 13, endVerse: 18 }
};
