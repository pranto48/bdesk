-- Create drives table for admin-created drives
CREATE TABLE public.drives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  drive_type TEXT NOT NULL DEFAULT 'local', -- 'local', 'onedrive', 'googledrive'
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drives ENABLE ROW LEVEL SECURITY;

-- Create policies for drives
CREATE POLICY "Public drives viewable by everyone"
ON public.drives
FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can view their own drives"
ON public.drives
FOR SELECT
USING (created_by = auth.uid());

CREATE POLICY "Admins full access drives"
ON public.drives
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create cloud connections table
CREATE TABLE public.cloud_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL, -- 'onedrive', 'googledrive'
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  account_email TEXT,
  account_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.cloud_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for cloud connections
CREATE POLICY "Users can manage their own cloud connections"
ON public.cloud_connections
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all cloud connections"
ON public.cloud_connections
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_drives_updated_at
BEFORE UPDATE ON public.drives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cloud_connections_updated_at
BEFORE UPDATE ON public.cloud_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add drive_id to files table
ALTER TABLE public.files ADD COLUMN drive_id UUID REFERENCES public.drives(id);

-- Update files policies to include drive access
DROP POLICY "Read own files or system folder files" ON public.files;

CREATE POLICY "Read own files or system folder files or public drive files"
ON public.files
FOR SELECT
USING (
  (owner_id = auth.uid()) OR 
  (EXISTS (SELECT 1 FROM folders f WHERE f.id = files.folder_id AND f.is_system = true)) OR
  (EXISTS (SELECT 1 FROM drives d WHERE d.id = files.drive_id AND d.is_public = true))
);