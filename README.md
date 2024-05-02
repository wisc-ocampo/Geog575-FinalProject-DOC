
# *The DOCs!* (group) project
---
## team members
- [Dhakal,  Ashmita](https://github.com/ashmitadhakal)
- [Ocampo, Francisco](https://github.com/wisc-ocampo)
- [Carlton, Kenz](https://github.com/KenzCarlton)

## README final project status 75% / May 02
This final project is intended to aid in displaying the discrepancy in interest across regions of the world, given its focus (and associated aid, support, etc.) has historically, and continues to be, heavily centered on Western (especially American) interests.

To do this, we plan to make three major elements.
- a cartogram
- a line graph
- a POI retrieve function

The idea is that the cartogram will display, through a **proportional cartogram and choropleth** the interest in particular countries based on global google trends data (which goes back to January 2004). The **line graph** will offer a different visualization of interest, with the line colors varying based on the region of the world the country is from (to better emphasize what regions are more prominent in the current view of the world. (The cartogram will similarly distinguish by choropleth color in the regional view, though the line graph is not a choropleth, just a single color representing that region.) Additionally, users will be able to sequence through the line graph to show the world during different time periods (showing the peak interest year by year). Finally, spikes or other abnormalites in interest will allow have **points of interest (POIs)**, either as points on the graph or as pop-ups when selecting countries or regions on the map. These POIs will then open the retrieve either over the map or as a sidebar, detailing more information about the event that sparked global interests.

Both sets of data will also be able to be re-expressed to interest relative to the region (where regions are based on those set by the United Nations). Because google trends data is relative, all values are percentages relative to the highest interest value. On the global scale, that is the United States in November of 2020. Regional data will thus be relative to the highest value within countries of the region, which so far has proven to result in many new spikes of interest appearing that were previously minimized the by US's overwhelming dominance in global interest. These additional POIs will only appear and be distinguished in the regional view to better give an idea about all the global events that fell under the world's western-centric radar.

Currently, the cartogram and line graph are functional with the global data sets. What still needs to be done is:
- implement the sequence operator
- finish compiling the regional data sets
- research the POIs
- implement the POI expression
- finalize design decisions, such as assigning regions their colors

## final project proposal
### target user profile (persona)
**name and position:**
> Mary; *One Vision, One World* NGO; Community Manager

**background description:**
> Mary is an anthropologist and an activist who was newly hired as the community manager for an non-governmental organization based in the United States interested in promoted more equitable relations between all countries.
> As part of this work, one of her major goals is to establish and promote interest for under-represented regions of the globe;
> unfortunately, it is difficult to communicate to outsiders how skewed their view of the world is.
> Additionally, it is also difficult to understand what events peak global interest or promote care for others far away from their country.
> In other words, she desires a presentation that allows the public to easily *identify* their skewed worldview.
> Furthermore, she hopes the tool can aid her team in *comparing* and *ranking* inequalities in representation (in the public mind) to better plan interventions promoting a more ethnorelativistic view.
> Through this, she plans to develop *insights* about the Western-centric worldview, such as which countries are *better or worse off* because of it and which regions have many *anomalies* or *outliers*.
> Finally, she desires the map to be flexible enough to accommodate changes in audience, such as being able to delineate into specific regions, making a distinction between *inside* and *outside groups*, aiding in seeing trends obscured by the complete dominance of the United States on the world stage.
[218 words]
### user case scenario
> Given her que, Mary is asked to now present to a committee discussing the distribution of humanitarian aid across South Asia.
> She has five minutes to set the stage for her colleague to argue for additional aid to be distributed to under-represented countries in the region.
> Upon opening the interactive, it defaults to the world cartogram based strictly on geographic area.
> By pressing **next**, the cartogram shifts to present the world when interest was most similar globally.
> Pressing **next** again shifts the cartogram to present the world when it was interested about just one country.
> Pressing **next** again shows world interest with the US affected, which was covertly kept in the geographic view until now.
> Within one minute, the global bias in worldview was *identified*.
> Several regions of the world are now highlighted in the geographic view, including South Asia.
> Mary clicks the region, and it zooms into the region, first in the geographic, then in global interest.
> A timeline appears at the bottom, highlighting [*ranking*] major events, which can be clicked to shift the cartogram to that point in time.
> Using a switch button at the top of the screen, the view now changes to show only relative interest within the region.
> Many previously absent countries now pop into existence, and the timeline now updates to show many other major events.
> Given their own devices to explore, the committee begins to question their view of the region's need, *comparing* their own thoughts, the geographic view, the global interest, and the regional interest.
> Furthermore, they realize how greatly the US *outlier* skews the world view.
[257 words]
### requirements document
#### representation
1. *geographic cartogram:* data about country's geographic area, calculated from the **Natural Earth, Admin 0 - without boundary lakes** shapefile that was used to determine countries.
2. *worldview cartogram:* **Google Trends** data of every country, relative to the highest interest [US, Nov 2020] (already collected)
4. *regional view cartogram:* **Google Trends** data relative to the regions of interest, expecting about 4 - 7
5. *interest graph:* bar graph of relative interest of either (toggle-able) top five countries or quartile countries
6. *highlight:* highlights regions which can be clicked to focus on
7. *overview:* tells the user the current view they are in
#### interaction
1. *launch screen:* **overview**. Provide a brief description of what one is about to see, as well as *continue* and *skip* buttons.
2. *first interactive:* **sequence, reexpress:** objects. (Tutorial only) If the option is selected in the launch screen, provide a slider / radio buttons where the user is prompted to select the most accurate representation of Earth's countries' land masses.
3. *results panel:* **overlay:** objects. (Tutorial only) Display choice on top of the actual answer; fade into the geographic cartogram.
4. *view panel:* **reexpress:** objects. Display querried expression, i.e., geographic data, interest data, interest data minus the USA (Tutorial runs through series of real and false projections: [equal worldview (false): countries have same levels of interest], [extreme unequal worldview (true): countries have extremely varying levels of interest (range is highest in Nov 2020)], [unequal or most recent worldview (true): contries show example of true/current levels of interest]).
5. *global timeline:* **sequence:** time, objects. Display query results by changing the cartogram to reflect the timeline sequence.
6. *global timeline key spots:* **retrieve:** objects. Display query results for specific timeline point of interest (anomaly) (x3 for tutorial).
7. *regional highlight:* **overlay, pan, zoom:** objects. Prompt user to click a highlighted region; display "zoomed in" map of clicked region.
8. *regional view panel:* **reexpress, filter:** objects. Display querried expression with added option of regional interest [geographic, global interest, regional interest].
9. *regional timeline:* **sequence:** time, objects. Display query results by changing the cartogram to reflect the timeline sequence (specific to region).
10. *regional timeline key spots:* **retieve:** objects. Display query results for new timeline points of interest (obscured by global interest); additional number to show the jump in POIs.
11. *back:* **overlay:** object. (Tutorial only) Highlights the button to return to the global cartographic map, allowing user to explore other regions or sequence through time.
12. (*skip* fades straight to this.) 
### wireframes
**wireframe 1:** *World view; world expression*
![Screenshot 2024-04-24 142745](https://github.com/wisc-ocampo/Geog575-FinalProject-DOC/assets/157846504/55d58180-4c23-4c2e-8537-de2ba175d3c7)
**wireframe 2:** *World view; regional selection*
![Screenshot 2024-04-24 142805](https://github.com/wisc-ocampo/Geog575-FinalProject-DOC/assets/157846504/bdfc78b0-dc41-4fd7-bfa0-1c3b1180ccba)
**wireframe 3:** *Regional view; regional expression*
![Screenshot 2024-04-24 142825](https://github.com/wisc-ocampo/Geog575-FinalProject-DOC/assets/157846504/db9ae6fe-4c7d-4298-9f0d-7ebc2bf49c9e)


---
---
---
# outdated
**wireframe 1:** *launch screen*
![wireframe_1](https://github.com/wisc-ocampo/Geog575-FinalProject-DOC/assets/157857305/8946866a-42bf-4731-a566-5f3c5c9f3218)
**wireframe 2:** *first interactive*
![wireframe-2](https://github.com/wisc-ocampo/Geog575-FinalProject-DOC/assets/157857305/bd21cd60-2f72-43f4-825b-e1cf734a540a)
**wireframe 3:** *results panel 1*
![wireframe-3](https://github.com/wisc-ocampo/Geog575-FinalProject-DOC/assets/157857305/17aacc5e-d4d5-4d0e-b0fd-31768d599889)
**wireframe 4:** *results panel 2*
![wireframe-4](https://github.com/wisc-ocampo/Geog575-FinalProject-DOC/assets/157857305/1e405fe2-54e8-44a8-a110-94862ab68e30)
**wireframe 5:** *worldview cartogram*
![wireframe-5](https://github.com/wisc-ocampo/Geog575-FinalProject-DOC/assets/157857305/3268353d-61df-4a3b-8736-c0c77d2aeb5b)
**wireframe 6:** *regional highlight*
![wireframe-6](https://github.com/wisc-ocampo/Geog575-FinalProject-DOC/assets/157857305/895a7ac8-2a18-400b-a1db-fe5fd9503b4a)
**wireframe 7:** *regional cartogram*
![wireframe-7](https://github.com/wisc-ocampo/Geog575-FinalProject-DOC/assets/157857305/4c6cd081-b608-41ed-975d-a490ad31cdec)
### final project brainstorm
**around the world heatmap**
> suggestion to chart real and, or, fictional circumnavigations around the world, supporting features such as concurrent navigation to compare the timelines of travel
- alternative, major navigations, such as the race to the poles

**strabospot**
> use of strabospot to create a personal photograph map of our local area
- unknown possibilities
    - litter around campus
    - study spots around campus

 **etymology of Wisconsin**
> looking into the history of Wisconsin cultural names origin's in geography or culture

**palimpsest map**
> writing that has been erased and written over, but which is still legible; an exploration of the old maps of our local area or where we call home and how those traces are still etched into our modern day design

**media presence of the globe**
> a cartographic map showing the extent of the global reach marking major regions that would be explored. Additionally, extra layers would be assigned based on:
> - true geographic area
> - english media presence / opinion
> - nepali media presence / opinion
> - spanish media presence / opinion
> These layers would shift the cartogram based on media presence
## final project proposal
> a cartogram showing changes in google trends interest, altering a countries physical geographic size relative to its percent interest for that year. alongside the map, viewers would be presented with highlights from that year in the form of stories for each region through the sequence exploration of the map.
### needed features
#### data
- data set of the countries google trends interest
- data set of countries land mass (km / miles)
- lots of lots of research google trends peaks / history
#### operands
- sequence / yes
- overlay / maybe
- overview / no
- resymbolize / yes
- zoom / maybe
- pan / maybe
- reproject / no (check)
- filter / no
- search / no
- retrieve / yes
- arrange / no
- calculate / no
## persona/scenario
### persona
Mary is a normal person who is interested in learning more about how the world and how its focus has shifted to different parts of it over time.
She has a poor understanding of how different regions of the globe **compare** during and over time.
She also has a poor understanding of how important countries are viewed (**ranked**) relative to eachother.
### scenario
Using our website, she will gain a better idea of **trends** and **patterns** over time as she explores the map through **sequence** and **retieve** operators.
Our stories will highlight **outliers** and **anomalies** using the **sequence** operator as a means of demonstating points of interest throughout the map and timeline.
She may also begin to develop **associations** between certain countries' relationships in the trends.
## requirements document
**Scope:** a brief history of global shifts in focus through the past 16 years.
## wireframes
to be determined (drawn)
