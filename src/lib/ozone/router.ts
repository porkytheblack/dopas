import {Router} from "ozone-router"
import { openai_model } from "./models"

export const router = new Router() 
router.register(openai_model)