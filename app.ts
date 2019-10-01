
import { prisma } from '../src/prisma/prisma-client';
import * as express from 'express';
import * as multer from 'multer';
import * as csv from 'csvtojson';
import * as Bluebird from 'bluebird';
import * as fs from 'fs';
const app: express.Application = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

const upload = multer({ dest: 'tmp/' });
app.post('/uploadCSV', upload.single('file'), function (req, res) {
  
  csv()
  .fromFile(req.file.path)
  .then(async (packs)=>{
      try{
        const packageMap = packs.map( packs => ({
          ...packs,
        pointId: parseInt(packs.pointId),
        isDelivered: !!parseInt(packs.isDelivered)
        }
        ));
        await Bluebird.map(packageMap, async ({ code, ...pack }) => {
          const response = await prisma.createEvidence({
            ...pack,
            type: {
              connect: {
                code
              }
            }
          })
          console.log("response",response.id);
          //return fs.unlinkSync('./tmp/');
          return Promise.resolve(true);
        },{
          concurrency: 1,
        });
      }catch (e){
        console.log(e)
      }

      res.send("ok");
      //fs.unlinkSync('./tmp/');
  });

});
