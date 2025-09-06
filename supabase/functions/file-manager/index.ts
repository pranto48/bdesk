import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FileSystemItem {
  id: string
  name: string
  type: 'folder' | 'file'
  path: string
  size?: number
  modified?: Date
  permissions?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    const path = url.searchParams.get('path') || '/'

    switch (action) {
      case 'list':
        return await listDirectory(path)
      case 'create':
        return await createFolder(req)
      case 'delete':
        return await deleteItem(req)
      case 'rename':
        return await renameItem(req)
      case 'copy':
        return await copyItem(req)
      case 'move':
        return await moveItem(req)
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('File manager error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function listDirectory(dirPath: string): Promise<Response> {
  try {
    const items: FileSystemItem[] = []
    
    // Read directory contents
    for await (const dirEntry of Deno.readDir(dirPath)) {
      const fullPath = `${dirPath}/${dirEntry.name}`.replace('//', '/')
      let stat: Deno.FileInfo | null = null
      
      try {
        stat = await Deno.stat(fullPath)
      } catch (error) {
        console.log(`Could not stat ${fullPath}:`, error.message)
        continue
      }
      
      const item: FileSystemItem = {
        id: crypto.randomUUID(),
        name: dirEntry.name,
        type: dirEntry.isDirectory ? 'folder' : 'file',
        path: fullPath,
        size: stat.size,
        modified: stat.mtime || new Date(),
      }
      
      items.push(item)
    }
    
    // Sort: folders first, then files, both alphabetically
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
    
    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Directory listing error:', error)
    return new Response(JSON.stringify({ 
      error: `Cannot access directory: ${error.message}`,
      items: [] 
    }), {
      status: 200, // Return 200 with empty items instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function createFolder(req: Request): Promise<Response> {
  const { path, name } = await req.json()
  const fullPath = `${path}/${name}`.replace('//', '/')
  
  try {
    await Deno.mkdir(fullPath, { recursive: true })
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function deleteItem(req: Request): Promise<Response> {
  const { path } = await req.json()
  
  try {
    const stat = await Deno.stat(path)
    if (stat.isDirectory) {
      await Deno.remove(path, { recursive: true })
    } else {
      await Deno.remove(path)
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function renameItem(req: Request): Promise<Response> {
  const { oldPath, newPath } = await req.json()
  
  try {
    await Deno.rename(oldPath, newPath)
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function copyItem(req: Request): Promise<Response> {
  const { sourcePath, destinationPath } = await req.json()
  
  try {
    await Deno.copyFile(sourcePath, destinationPath)
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function moveItem(req: Request): Promise<Response> {
  const { sourcePath, destinationPath } = await req.json()
  
  try {
    await Deno.rename(sourcePath, destinationPath)
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}