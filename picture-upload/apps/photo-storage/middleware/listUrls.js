/*
  Copyright 2017 Linux Academy
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

module.exports = (req, res) => {
  req.app.locals.s3Store.listPhotos(req.params.bucket, req.query.limit, req.query.cursor)
    .then(result =>
      Promise.all(result.Contents.map(
        obj => req.app.locals.s3Store.getPhotoUrl(req.params.bucket, obj.Key)
      ))
        .then((urls) => {
          res.json({
            cursor: result.NextContinuationToken,
            limit: result.MaxKeys,
            photos: urls,
          });
        })
    )
    .catch((e) => {
      if (e.statusCode && e.code && e.message) {
        return res.status(e.statusCode).json({
          code: e.code,
          message: e.message,
        });
      }

      res.status(500).json({
        code: 'InternalServerError',
        name: e.name,
        message: e.message,
      });
    });
};
