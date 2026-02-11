import { Request, Response } from 'express';

import { RequestContext } from '@/types/context';

export type GraphqlContext = RequestContext & { req: Request; res: Response };
