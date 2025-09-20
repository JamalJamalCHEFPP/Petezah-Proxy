// /app/api/scramjet/route.ts (Next.js App Router)
import { join } from 'path';
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
