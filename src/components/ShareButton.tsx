import { useState } from 'react';
import { Share2, Copy, Check, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  url?: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export function ShareButton({ title, url, variant = 'icon', className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  if (variant === 'icon') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`w-10 h-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center text-background hover:bg-background/30 transition-colors ${className}`}>
            <Share2 className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareToWhatsApp} className="cursor-pointer">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer">
            <Facebook className="w-4 h-4 mr-2" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer">
            <Twitter className="w-4 h-4 mr-2" />
            Twitter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleNativeShare} className={className}>
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
}
