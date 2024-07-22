'use client';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import React, { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import ListingCard from "../elements/trip-card"
import ListingCardExample from "../elements/trip-card-blur-example"
import ApiService from "../../services/apiService";
import { getUserId, getAccessToken } from "../../lib/actions"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
    MessageSquareShare,
    BarChartHorizontal,
    Linkedin,
    Github,
    Instagram,
    Mail,
    Pencil,
    Trash2, 
    LoaderCircle
} from "lucide-react"

const initialListings = [
  {
    id: 1,
    title: "Cozy Studio in Downtown",
    imgSrc: "/photo.png",
    alt: "Apartment 1",
    dateRange: "May 1 - May 7",
    country: "USA",
    city: "New York",
    description: "A cozy studio in the heart of downtown.",
    minBudget: 100,
    url: "https://example.com/listing/1",
    month: "May",
    isFlexible: true,
    createdBy: "John Doe",
    createdByUsername: "DmitryKorzhov"
  },
]

interface UserProfileProps {
  userId: string;
}

interface UserProfile {
  name: string;
  email: string;
  photo: string;
  id: string;
  about: string;
  coliver_preferences: string;
  language: string;
  social_media_links: Record<string, string>;
  travel_status: string;
  username: string;
}


function getSocialIcon(url: string) {
  if (url.includes("x.com") || url.includes("twitter.com")) {
    return <img src="/x.svg" className="h-3 w-3" alt="X Icon" />; 
  } else if (url.includes("linkedin.com")) {
    return <Linkedin className="h-4 w-4" />;
  } else if (url.includes("github.com")) {
    return <Github className="h-4 w-4" />;
  } else if (url.includes("instagram.com")) {
    return <Instagram className="h-4 w-4" />;
  } else if (url.includes("@gmail.com")) {
    return <Mail className="h-4 w-4" />;
  }
  return <MessageSquareShare className="h-4 w-4" />;
}

const languages = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Korean', label: 'Korean' },
];

const travelStatuses = [
  { value: 'Ready to travel', label: 'Ready to travel' },
  { value: 'Not ready to travel', label: 'Not ready to travel' },
  { value: 'Will be ready soon', label: 'Will be ready soon' },
];

export default function UserProfile({ userId }: UserProfileProps) {
  const [listings, setListings] = useState(initialListings.map(listing => ({ ...listing, isAvailable: false })))
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState<{ [key: string]: string[] }>({});


  useEffect(() => {
    async function fetchCurrentUserId() {
      const id = await getUserId();
      setCurrentUserId(id);
    }

    async function fetchToken() {
      const accessToken = await getAccessToken();
      setToken(accessToken);
    }

    fetchCurrentUserId();
    fetchToken();
  }, []);

  useEffect(() => {
    setListings(listings.map(listing => ({
      ...listing,
      isAvailable: Math.random() > 0.5
    })))
  }, [])

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await ApiService.get(`/api/user/data/get/${userId}/`);
        if (response) {
          const profileData: UserProfile = {
            name: response.name,
            email: response.email,
            photo: response.photo,
            id: response.id,
            about: response.about,
            coliver_preferences: response.coliver_preferences,
            language: response.language,
            social_media_links: response.social_media_links,
            travel_status: response.travel_status,
            username: response.username,
          };
          setUserProfile(profileData);
        } else {
          console.error("No data in response");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    }

    fetchProfileData();
  }, [userId]);

  if (!userProfile) {
    return <div>Loading...</div>;
  }


  const handleEditClick = () => {
    setIsEditing(true);
    setEditedUser(userProfile);
  };

  const handleSaveClick = async () => {
    if (editedUser) {
      setIsLoading(true);
      try {
        const formattedLinks = Object.entries(editedUser.social_media_links).reduce((acc: Record<string, string>, [platform, link]) => {
          acc[platform] = link;
          return acc;
        }, {});

        const formData = new FormData();
        formData.append('name', editedUser.name);
        formData.append('language', editedUser.language);
        formData.append('travel_status', editedUser.travel_status);
        formData.append('about', editedUser.about);
        formData.append('coliver_preferences', editedUser.coliver_preferences);
        formData.append('social_media_links', JSON.stringify(formattedLinks));
        formData.append('username', editedUser.username);

        formData.forEach((value, key) => {
          console.log(`${key}: ${value}`);
        });
  
        const response = await ApiService.put_form('/api/user/data/update/', formData);
        
        if (response.status === 200) {
          setUserProfile(response.data);
          setIsEditing(false);
          toast("Profile updated successfully");
        } else {
          throw new Error(`Failed to update profile: ${response.statusText}`);
        }
      } catch (error: any) {
        console.error('Failed to update profile:', error);
        try {
          const errorData = JSON.parse(error.message);
          setErrorMessages(errorData);
        } catch (e) {
          toast("Failed to update profile");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedUser(userProfile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [e.target.name]: e.target.value,
      });
    }
  };
  const handleSelectChange = (name: string, value: string) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [name]: value,
      });
    }
  };

  const handleLinkPlatformChange = (id: string, value: string) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        social_media_links: {
          ...editedUser.social_media_links,
          [id]: value,
        },
      });
    }
  };

  const handleLinkChange = (platform: string, value: string) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        social_media_links: {
          ...editedUser.social_media_links,
          [platform]: value,
        },
      });
    }
  };

  const handleAddLink = () => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        social_media_links: {
          ...editedUser.social_media_links,
          [`new-${Date.now()}`]: '',
        },
      });
    }
  };

  const handleRemoveLink = (platform: string) => {
    if (editedUser) {
      const updatedLinks = { ...editedUser.social_media_links };
      delete updatedLinks[platform];
      setEditedUser({
        ...editedUser,
        social_media_links: updatedLinks,
      });
    }
  };

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-left justify-left min-h-screen">
      <div className="flex flex-col lg:flex-row w-full max-w-full bg-white gap-10">
        <div className="w-full lg:w-3/4">
          <Card>
            <CardContent>
              <div className="flex flex-col items-start mt-4">
                <div className="flex items-start w-full">
                  <Avatar className="w-24 h-24 rounded-[10px]">
                    <AvatarImage src={userProfile.photo} />
                    <AvatarFallback>D</AvatarFallback>
                  </Avatar>
                  {currentUserId === userProfile.id && token && (
                    <Button variant="ghost" size="icon" className="ml-auto" onClick={handleEditClick}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <>
                    <Input
                      type="text"
                      name="name"
                      value={editedUser?.name || ""}
                      onChange={handleChange}
                      className="mt-4"
                    />
                    <Textarea
                      name="about"
                      value={editedUser?.about || ""}
                      onChange={handleChange}
                      className="mt-2"
                    />
                    <Select onValueChange={(value) => handleSelectChange('language', value)} value={editedUser?.language || ""}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(language => (
                          <SelectItem key={language.value} value={language.value}>
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      name="coliver_preferences"
                      value={editedUser?.coliver_preferences || ""}
                      onChange={handleChange}
                      className="mt-2"
                    />
                    <Select onValueChange={(value) => handleSelectChange('travel_status', value)} value={editedUser?.travel_status || ""}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select travel status" />
                      </SelectTrigger>
                      <SelectContent>
                        {travelStatuses.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <h3 className="mt-6 text-lg font-semibold">Contacts</h3>
                    <div className="mt-2 flex flex-col gap-3 w-full">
                    {editedUser?.social_media_links && Object.entries(editedUser.social_media_links).map(([platform, link]) => (
                          <div key={platform} className="flex items-center gap-2 w-full">
                            <div className="flex-grow">
                              <Select value={platform} onValueChange={(value) => handleLinkPlatformChange(platform, value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a platform" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Github">Github</SelectItem>
                                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                  <SelectItem value="Facebook">Facebook</SelectItem>
                                  <SelectItem value="Twitter">Twitter</SelectItem>
                                  <SelectItem value="Instagram">Instagram</SelectItem>
                                  <SelectItem value="Google">Google</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-grow">
                              <Input
                                id={`link-${platform}`}
                                placeholder="Enter a link"
                                value={link}
                                onChange={(e) => handleLinkChange(platform, e.target.value)}
                                className="w-full"
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveLink(platform)}
                              className="ml-2 flex items-center justify-center min-w-[40px] h-10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      <Button variant="link" className="justify-start" onClick={handleAddLink}>Add Link</Button>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleSaveClick} disabled={isLoading}>
                      {isLoading ? <LoaderCircle className="animate-spin w-4 h-4" /> : "Save"}
                      </Button>
                      <Button variant="outline" onClick={handleCancelClick} disabled={isLoading}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="mt-4 text-xl font-semibold">{userProfile.name}</h2>
                    <div className="mt-2 text-sm text-green-6000">
                      <Badge variant="outline">{userProfile.travel_status}</Badge>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold">About</h3>
                    <p className="mt-2 text-sm">{userProfile.about}</p>
                    <h3 className="mt-6 text-lg font-semibold">Language</h3>
                    <Badge variant="outline" className="mt-2">{userProfile.language}</Badge>
                    <h3 className="mt-6 text-lg font-semibold">Co-livers Preferences</h3>
                    <p className="mt-2 text-sm">{userProfile.coliver_preferences}</p>
                    <h3 className="mt-6 text-lg font-semibold">Contacts</h3>
                    <div className="mt-2 flex gap-4">
                    {userProfile.social_media_links && Object.entries(userProfile.social_media_links).map(([platform, url]) => (
                        <a key={platform} href={url} target="_blank" rel="noopener noreferrer">
                          <Button variant="link" className="inline-flex items-center">
                            {getSocialIcon(platform)}
                            <span className="ml-2">{platform}</span>
                          </Button>
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>           
          <div className="w-full lg:w-3/4">
            {listings.length === 0 ? (
              <div className="flex justify-center items-start h-full">
                <ListingCardExample />
              </div>
            ) : (
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="flex justify-end">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-1 lg:grid-cols-1">
                    {listings.map((listing) => (
                      <ListingCard 
                        key={listing.id} 
                        id={listing.id}
                        title={listing.title}
                        imgSrc={listing.imgSrc}
                        alt={listing.alt}
                        country={listing.country}
                        city={listing.city}
                        description={listing.description}
                        minBudget={listing.minBudget}
                        url={listing.url}
                        month={listing.month}
                        createdBy={listing.createdBy}
                        showUser={false}
                        createdByUsername={listing.createdByUsername}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
      </div>
    </div>
  )
}