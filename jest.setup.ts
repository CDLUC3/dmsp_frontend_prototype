import '@testing-library/jest-dom';
import dotenv from 'dotenv';

//Load environment variables from .env.local
dotenv.config({ path: './.env.local' });// 
global.Request = jest.requireActual('node-fetch').Request;
global.Response = jest.requireActual('node-fetch').Response;
