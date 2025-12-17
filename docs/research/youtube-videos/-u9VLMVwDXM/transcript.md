# Transcript

> **Video**: (Title unknown; transcript extracted via MCP)  
> **URL**: https://www.youtube.com/watch?v=-u9VLMVwDXM  
> **Date**: 2025-12-17

---

[0:00] What's up guys? Welcome to a new video. And today we are going to be taking a look at the new Z image AI generator. And before we start the video, just to give you a look, these are some images I have generated when playing with this model for the last few days. Keep in mind that those images were generated literally in seconds while other models like Gwen or one can take a few minutes. And I believe some of these images can be used for a fresh wave of AI influencers because all of the previous

[0:35] models like Flux or Seedream, they have this specific features to them. And many people who do AI influencers can already recognize them, but this is giving them a new fresh start. So before I tell you how you can set it up, how to use the workflow, how to download the models, how to download the custom nodes, and how to run it yourself and how to use my prompt generator made in Grog. So you can generate not safe for work images on our discord in free resources. There is

[1:06] a link that goes to grog.com, which which is an AI generator, but it is not restricted. So it allows you to do sexual content. It allows you to do not safe for work images and stuff like that. If I were to post these things into Gemini or cloud, it would not generate anything because those models are heavily monitored. This model is uncensored as [ __ ] and it is the best use for such prompts. And lastly, before the setup, what even is the reason why you should want to use Z image? Well, on

[1:37] their official website, you can read a few things, but the main thing is that it follows prompts very closely. It is super fast compared to other models and it can do extremely accurate texts on objects. So if you want to create a girl and put some texts on her t-shirt, you can do it using this model. There will be free versions of Z image. But for now, we only have available Z image Turbo. It is the least powerful model, but it still gives you very good results. So in my opinion, I believe

[2:11] when the base model comes out and the edit model comes out, it will be the state-of-the-art model, it will be the best model. So that's why you should learn it to use today. So when those models comes out, you will be an expert. Okay, so let's get started. There are three things that we are going to be using. First of all is the prompt generator that you can find in the free resources. And second of all, and second of all is a workflow that I modified from this guy. And I also created a full

[2:42] installation script for all of the models, all of the VAEEs, all of the text encoders and stuff like that. So we can just install the custom missing nodes and it will work automatically. Okay, so let's get started. I'm going to be using runpod because I have some extra credits here, but you can use anything you want. I'm not going to be using a network volume. I'm going to be using a completely fresh pot so I can show you how you can set it up. So, first of all, I'm going to choose some

[3:11] GPU. If you want, you can choose a cheaper GPU because this is a small model and you will still able and you will still be able to generate in reasonable times. I believe this is a bit overkill for this model, but I don't want to wait for too long while doing this video. So, I'm going to choose this GPU. And for the pot template, you are going to choose comfy UI manager permanent disk torch 2.4. This one to see how much space do we have. It says 40 GB on the container disc and 120 on

[3:43] the volume disc. This should be more than enough. And we can start now. We are going to be waiting like five or 10 minutes until it loads. So when it loads, I will get back to you and we will get to the installation part. Okay. So after 16 minutes of grueling, waiting and staring into my wall, our pot is already launched. So now you click on the pot, you open Jupyter lab, and you are here. Now you are going to go to Discord to workflows and here you are going to download the JSON file which is

[4:19] the actual workflow, but we will use that later. But for now, you need to download this script. This script will install all of the models that you need. So you go back to Jupyter Lab, you open terminal and you must make sure you are in the workspace folder otherwise it will not work. See we are in the workspace folder. That is perfect. Now you take the script and you just put it here in the workspace folder. And now you type bash download and if you press

[4:50] tab it will autocomplete the entire name of the file. I have the one here because I have already downloaded it once. And now you just press enter. And now it will download the custom nodes that are not downloadable through confi. And it will download all of the necessary models. So you don't have to do anything manually. You don't have to go to hugging face search zimage models z image vae this this text encoder and blah blah blah blah blah. It will do everything automatically. So when it's

[5:23] done you can just launch the conf UI install the rest of the custom nodes and you are done and you can just use it. So now we are going to wait a bit again and then I'll get back to you. And now when you see this message it means that it has been loaded. So you are going to go back to runpot. You are going to open your pot and you are going to click on confi. Now it loads the basic version with no workflow and that's the reason why we downloaded the JSON file. Now we

[5:53] are going to use this file the last one Z image dandrei modified loaders JSON which we are going to drag and drop into confi. So now I'm going to do that. The workflow has been loaded but there is one last custom missing node. So we are going to go to manager install custom missing nodes. We are going to close this error and we are going to install those those nodes and then we are going to restart our confi. So those have been installed. Now we click restart and that

[6:25] should be all. And now our confi has restarted. So we are going to refresh the page. Hopefully it's going to work. See now it's working. And now you see there are no missing nodes. Everything is working. So you can just press run to see that the basic prompt is working. And after we will be able to do the basic prompt then I will show you the prompt generator. And as you can see our image is loading. The workflow has 20 steps. So it takes few seconds. The first generation of course takes the

[7:02] most amount of time because these base models have to load at first. And you see we have our image generated. This is not an image that I want to use for my AI influencer. This is just a default prompt in this workflow. So now we are going to use grog and we are going to use the good prompts. So now when you go to free resources and you open the prompt generator, you see that this opens. Let me see if I can make it smaller. Yes, I can. Perfect. And you see that you have some sample prompts

[7:34] that you can use. So we are going to use three prompts just from here just to get some basic images and I will show you them later. So this is the one use case of the grog prompt generator. But for example, if your character is a gamer girl and you already and you already have a Z image trained Laura that you are using in this workflow, you can just type something like create another five images for a gamer girl that has black hair. Make sure those images are teasy but safe for work. The

[8:13] reason we are not doing not safe for work is that we are on YouTube and I don't want to get banned. Okay, you can see that the prompts are generating. So, we can just copy the first three prompts once again. Well, there is a slight problem. The images that have been generated are nude and we don't want that on YouTube. So, now I'm going to tell him make sure the girl is fully clothed and nothing not safe for work is visible. and we are going to use those prompts. Okay. Okay. So now we can see

[8:46] that those safe for work prompts have been created. You see that this image right here is not safe for work. So I cannot show it on YouTube. But now we are going to use those three prompts and hopefully I will be able to show you the images. Many of you have been asking me for how to generate not safe for work. Well, I think this is the way because this model with grog is generating not safe for work images even when I don't want to. Okay, now I'm going to actually

[9:14] cut the video a lot and just just show you the safe for work images because for the reason of gro I cannot show you all of the images at once. So this is an image we have generated. This is another safe for image and here we have an image as well. You see that not all of those pictures are actually perfect. And the reason for that is that we are using the turbo model, the small model, but once the base model comes out, the re the results are going to be so good that I

[9:43] believe that it will be the most used model. So yeah, that's it for today's video. Depending on your model or or the on the girl that you want to generate, you can just modify those prompts. You can, I don't know, tell him to generate a ginger girl. You can tell him to generate a fat girl. it doesn't really matter and you can get a very good prompts and very good results. If you decide to train a Z image Lora, you can also get a super consistent character and training Z image Laura will probably

[10:12] be the topic of my next videos. Okay, see you soon. Bye.

---

## Timestamped Segments

- `[0:00]` - Z-Image-Turbo intro: “generated in seconds”; “fresh wave” vs recognizable Flux/Seedream look
- `[1:37]` - Why Z-Image: prompt adherence, speed, accurate text rendering on objects
- `[2:42]` - Setup approach: RunPod + ComfyUI; install script downloads models/VAEs/text encoders/custom nodes
- `[5:53]` - Load workflow JSON; install missing nodes via manager; restart; run generation
- `[7:34]` - Prompt generator usage; notes NSFW prompting tendency; “fully clothed” constraint for SFW
- `[9:14]` - Turbo quality caveat; expectation base model will be significantly better
