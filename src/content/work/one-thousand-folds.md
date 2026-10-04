---
order: 3
title: One Thousand Folds
titleLines: ['One Thousand', 'Folds']
client: Kōzo Paper Museum
sector: Culture
year: 2025
disciplines: ['Exhibition identity', 'Wayfinding', 'Installation']
role: Creative direction and creative engineering
logline: An exhibition about folding, where the visitor's hand does the folding.
layout: left
plate: folds
ratio: '1/1'
alt: A sheet of paper pleated into sharp diagonal folds, light and shadow alternating, crossed by one vermilion crease.
detailAlt: Detail of the pleats, the shadowed faces printed as a fine halftone screen.
facts:
  - { label: Duration, value: 7 months }
  - { label: Deliverables, value: 'Identity, wayfinding, interactive installation' }
  - { label: Built with, value: 'WebGL, depth camera, a custom crease solver' }
---

## The brief

A touring exhibition of a hundred years of folded paper, from origami to the solar arrays that unfold in orbit. The curators needed an identity, a wayfinding system and one centrepiece that would make people stay.

## The cut

The centrepiece is a six-metre projected sheet that visitors fold with their hands. Every crease is simulated and *permanent for the day*. At closing, the sheet is printed as that day's exhibition poster, and the next morning starts flat again.

## The system

Headlines are set on a crease grid, so the type folds where the paper would. Rooms are numbered by fold count: room one has one fold. The simulation runs in WebGL on a single machine, reading hands from a depth camera, and degrades to a still sheet if anything fails, because an exhibition can't show an error screen.

## Afterwards

Each venue keeps its posters. After the first stop there were ninety-four of them, no two alike.
