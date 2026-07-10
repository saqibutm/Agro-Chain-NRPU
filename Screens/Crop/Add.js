import React from "react";
import AddWheatBatch from "../Shared/AddWheatBatch";

const AddCrop = ({ navigation }) => (
	<AddWheatBatch
		navigation={navigation}
		idLabelKey="cropId"
		headerKey="cropProduced"
		submitLabelKey="addCrop"
		validateScreen="ValidCrop"
	/>
);

export default AddCrop;
