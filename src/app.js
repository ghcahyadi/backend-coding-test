
const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const logger = require('../config/winston');

// eslint-disable-next-line consistent-return
function checkInputString(param, label, res) {
  if (typeof param !== 'string' || param.length < 1) {
    return res.send({
      error_code: 'VALIDATION_ERROR',
      message: `${label} must be a non empty string`,
    });
  }
}

module.exports = (db) => {
  app.get('/health', (req, res) => {
    res.send('Healthy');
  });

  // eslint-disable-next-line consistent-return
  app.post('/rides', jsonParser, async (req, res) => {
    try {
      const startLatitude = Number(req.body.start_lat);
      const startLongitude = Number(req.body.start_long);
      const endLatitude = Number(req.body.end_lat);
      const endLongitude = Number(req.body.end_long);
      const riderName = req.body.rider_name;
      const driverName = req.body.driver_name;
      const driverVehicle = req.body.driver_vehicle;

      // eslint-disable-next-line max-len
      if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
        return res.send({
          error_code: 'VALIDATION_ERROR',
          message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        });
      }

      if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
        return res.send({
          error_code: 'VALIDATION_ERROR',
          message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        });
      }

      checkInputString(riderName, 'Rider Name', res);
      checkInputString(driverName, 'Driver Name', res);
      checkInputString(driverVehicle, 'Driver Vehicle', res);

      const values = [
        req.body.start_lat,
        req.body.start_long,
        req.body.end_lat,
        req.body.end_long,
        req.body.rider_name,
        req.body.driver_name,
        req.body.driver_vehicle,
      ];

      await db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
        // eslint-disable-next-line consistent-return
        values, async function (err) {
          try {
            if (err) {
              return res.send({
                error_code: 'SERVER_ERROR',
                message: 'Unknown error',
              });
            }
            // eslint-disable-next-line consistent-return,no-shadow
            await db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, (err, rows) => {
              if (err) {
                return res.send({
                  error_code: 'SERVER_ERROR',
                  message: 'Unknown error',
                });
              }
              res.send(rows);
            });
          } catch (ex) {
            logger.error(ex);
          }
        });
    } catch (ex) {
      logger.error(ex);
    }
  });

  app.get('/rides', async (req, res) => {
    try {
      // eslint-disable-next-line consistent-return
      await db.all('SELECT * FROM Rides', (err, rows) => {
        if (err) {
          return res.send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }

        if (rows.length === 0) {
          return res.send({
            error_code: 'RIDES_NOT_FOUND_ERROR',
            message: 'Could not find any rides',
          });
        }
        res.send(rows);
      });
    } catch (ex) {
      logger.error(ex);
    }
  });

  app.get('/rides/:id', async (req, res) => {
    try {
      // eslint-disable-next-line consistent-return
      await db.all('SELECT * FROM Rides WHERE rideID = ?', req.params.id, (err, rows) => {
        if (err) {
          return res.send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }
        if (rows.length === 0) {
          return res.send({
            error_code: 'RIDES_NOT_FOUND_ERROR',
            message: 'Could not find any rides',
          });
        }
        res.send(rows);
      });
    } catch (ex) {
      logger.error(ex);
    }
  });

  return app;
};
