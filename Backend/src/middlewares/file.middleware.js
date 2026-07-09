const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024, // Limit file size to 3MB
    },
    fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
            return callback(new Error('Only PDF resumes are allowed'));
        }

        return callback(null, true);
    },
});

module.exports = upload;
