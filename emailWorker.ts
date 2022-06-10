import { Worker } from 'bullmq';
import email from './src/helpers/email';'../helpers/email';



const worker = new Worker('emailJob', async job => {
  
  if (job.name === 'emailJob') {
    
    await email.emailConfirmation(job.data);
  }
});

export default worker;