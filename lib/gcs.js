const gcs = require('@google-cloud/storage');

const storage = gcs({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GCLOUD_STORAGE_CREDENTIALS | {}),
});

const bucket = storage.bucket(process.env.GCLOUD_BUCKET_PACKAGES);

module.exports = {
  uploadPackage: ({name, version, zip, cacheControl}) => {
    return new Promise((resolve, reject) => {
      const file = bucket.file(`${name}/${version}.zip`);
      let errored = false;
      zip.generateNodeStream()
        .pipe(file.createWriteStream({
          public: true,
          metadata: {
            contentType: 'application/zip',
            cacheControl: cacheControl || 'public, max-age=3600',
          }
        }))
        .on('error', (error) => {
          if (!errored) {
            errored = true;
            reject(error);
          }
        })
        .on('finish', () => {
          if (!errored) {
            resolve();
          }
        });
    });
  }
}
