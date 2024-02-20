const response = (statusCode, data, message, res) => {
    res.json(statusCode, [
        {
            payload: data,
            message
        }
    ])
}

module.exports = response

// const response = (statusCode, data, message, res) => {
//     res.status(statusCode).json({
//       payload: data,
//       message
//     });
//   };
  
//   module.exports = response;
  
  